import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase35PelikanSouveranVariantPacks } from "./phase35-pelikan-souveran-variants";

const RETRIEVED = "2026-07-27";
export const PHASE284_PELIKAN_ID = "VXUULuCOLOB1";
export const PHASE284_M300_ID = "phase284-pelikan-m300";
export const PHASE284_M300_SLUG = "pelikan-souveran-m300";
const MODEL_SCOPE = "phase284-pelikan-souveran-m300";

function source(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; group: string; summary: string; locator: string; itemType?: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType, tier: input.tier, independenceGroup: input.group, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: input.itemType ?? "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

const mam = source({ key: "phase284-pelikan-m300-mam", title: "Pelikan M300 Black-Green official product record", url: "https://mam.pelikan.com/mam/en/pelikan/products/901462", registryKey: "pelikan-mam-phase284", registryName: "Pelikan official product archive", sourceType: "official", tier: "primary", group: "pelikan-mam-phase284", summary: "官方 MAM 将 M300 Black-Green 作为 Souverän 300 产品记录，并提供 14K 金尖与活塞产品边界。", locator: "M300 Black-Green product record" });
const archive = source({ key: "phase284-pelikan-m300-archive", title: "Pelikan Collectibles：M300 & M320 Souverän", url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M300-Basis/index.html", registryKey: "pelikan-collectibles-phase284", registryName: "Pelikan Collectibles", sourceType: "official", tier: "contemporary_archive", group: "pelikan-collectibles-phase284", summary: "专业档案记录 M300 约 1998 年起、110 mm、10 mm、11.0 g、0.65 ml，以及黑色和绿条纹生产窗口。", locator: "M300 chronology, measurements and production colors" });
const catalog = source({ key: "phase284-pelikan-fine-writing", title: "Pelikan Fine Writing Instruments M300 data", url: "https://mam.pelikan.com/en/pelikan/media/702326/download", registryKey: "pelikan-fine-writing-phase284", registryName: "Pelikan Fine Writing official", sourceType: "official", tier: "primary", group: "pelikan-fine-writing-phase284", summary: "官方 Fine Writing 资料列 M300 约 110 mm、直径 9.9 mm、10.7 g、0.7 ml 小尺寸数据。", locator: "M300 size, weight and capacity table", itemType: "pdf" });
const perch = source({ key: "phase284-pelikan-timeline", title: "The Pelikan's Perch：Pelikan timeline", url: "https://thepelikansperch.com/database/timeline/", registryKey: "the-pelikans-perch-phase284", registryName: "The Pelikan's Perch", sourceType: "blog", tier: "professional_secondary", group: "the-pelikans-perch-phase284", summary: "专业资料用于交叉核对 M300 与 M320/M350 小尺寸家族边界；不替代官方 SKU 规格。", locator: "Pelikan small-format family timeline" });
const care = source({ key: "phase284-pelikan-care-faq", title: "Pelikan FAQ：活塞钢笔上墨与清洗", url: "https://www.pelikan.com/int/products/writing/145-international/services/541-faq.html", registryKey: "pelikan-official-care-phase284", registryName: "Pelikan official site", sourceType: "official", tier: "primary", group: "pelikan-official-care-phase284", summary: "官方 FAQ 说明 Pelikan 活塞笔从瓶中吸墨、排空与清水清洁的基本路径。", locator: "Fine writing instruments FAQ: piston filling and cleaning" });
const svg: CuratedSource = { key: "phase284-pelikan-m300-svg", registryKey: "fountain-pen-graph-editorial-phase284", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase284", title: "Pelikan Souverän M300 identity boundary factual SVG", url: "/images/library/site-original/phase284/pelikan/m300.svg", homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样。", archiveUrl: "/images/library/site-original/phase284/pelikan/m300.svg", archiveLocator: "project-public-asset:/images/library/site-original/phase284/pelikan/m300.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900" };

const brand = structuredClone(phase35PelikanSouveranVariantPacks[0]);
if (!brand || brand.entityId !== PHASE284_PELIKAN_ID) throw new Error("Phase 284 Pelikan brand pack missing.");
brand.key = "phase284-pelikan-brand-v1";
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedEntityPack["claims"][number] { return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.97 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, locator, scopeKey: MODEL_SCOPE }] }; }
function ev(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string) { return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true }; }

const model: CuratedEntityPack = {
  key: "phase284-pelikan-m300-v1", entityId: PHASE284_M300_ID, expectedType: "pen", expectedSlug: PHASE284_M300_SLUG, canonicalName: "Pelikan Souverän M300", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/pelikan-m300-phase284-publishable-content-2026-07-27.md", storyTitle: "Pelikan Souverän M300：小尺寸 14K 金尖活塞笔", primarySourceKey: mam.key, depthTier: "A",
  aliases: [{ alias: "Pelikan Souverän M300", language: "en", sourceKey: mam.key }, { alias: "Pelikan M300", language: "en", sourceKey: archive.key }, { alias: "百利金 M300", language: "zh", sourceKey: mam.key }],
  sources: [mam, archive, catalog, perch, care, svg],
  scopes: [{ key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, market: "Pelikan Souverän M300 historical and current archive records", productionState: "historical", nibScope: "14 ct gold nib; nib width varies by SKU", materialScope: "high-grade resin or green-striped material; gold-plated trim", editionScope: "M300 Black and Green-striped production colors; M320/M350 excluded" }],
  claims: [
    claim("m300-identity", "model_identity", "M300 是 Souverän 家族的小尺寸独立型号，使用差动活塞与 14 ct 金尖，不是 M320 特别版或 M400 缩小版。", mam.key, "official M300 product identity"),
    claim("m300-history", "production_history", "档案将 M300 路线记为约 1998 年起，黑色约至 2008，绿条纹自 1998 年起另行记录。", archive.key, "M300 chronology and production colors"),
    claim("m300-nib", "nib", "M300 使用 14 ct 金尖；尖幅随具体 SKU 而定，不能把 M350 的 18 ct 尖或 M400 尖面直接泛化。", archive.key, "M300 nib field"),
    claim("m300-fill", "filling_system", "M300 使用 Pelikan 差动活塞，从瓶中吸入钢笔墨；它不是 P200/P205 等墨囊笔。", care.key, "piston filling FAQ"),
    claim("m300-material", "material_finish", "黑色或绿条纹树脂材料配镀金饰件构成 M300 的主要生产色路线；颜色不同不等于基础型号不同。", archive.key, "M300 production color and trim entries"),
    claim("m300-size", "physical_specification", "档案参考值约闭合 110 mm、直径 10 mm、11.0 g、容量 0.65 ml；官方资料的四舍五入值可能为 9.9 mm、10.7 g、0.7 ml。", archive.key, "M300 measurement table"),
    claim("m300-secondary-history", "model_family_boundary", "M300 与 M320 同属小尺寸 Souverän 家族，但 M320 是 2007–2011 特别版路线；M350 使用 vermeil 帽和 18 ct 尖，均不能并入 M300。", perch.key, "professional timeline and family boundary"),
    claim("m300-care", "maintenance_guidance", "换墨前排空旧墨，以冷至温清水缓慢吸排；小型活塞卡滞、裂纹或渗墨时停止强拧并交由专业维修者。", care.key, "official care path", "editorial"),
    claim("m300-buying", "selection_guidance", "购买时核对闭合长度、14K 尖刻、帽环、黑色或绿条纹笔杆、镀金饰件、尾钮、墨窗和年份；改装件不能证明整笔是 M300。", archive.key, "variant identification and buying boundary", "editorial"),
  ],
  variants: [
    { key: "m300-black", name: "Black", notes: "黑色笔杆、黑帽、镀金饰件，档案记为约 1998–2008。", sourceKey: archive.key, variantKind: "color", market: "global" },
    { key: "m300-green-striped", name: "Green-striped", notes: "绿条纹笔杆、黑帽、镀金饰件，档案记为约 1998 起。", sourceKey: archive.key, variantKind: "color", market: "global" },
  ],
  spec: { brandEntityId: PHASE284_PELIKAN_ID, values: { series_name: "Souverän M300", release_year: "约 1998 起；黑色约至 2008，绿条纹路线另记", origin_country: "德国品牌；官方 MAM 产品记录", nib: "14 ct 金尖；尖幅依 SKU", fill_system: "差动活塞；瓶装钢笔墨水", material: "高等级树脂或绿条纹材料；镀金饰件", dimensions: "档案参考：闭合约 110 mm、直径约 10 mm、约 11.0 g、容量约 0.65 ml", status: "Souverän 家族小尺寸生产型号；M320 与 M350 分开记录" }, evidence: [ev("m300-brand", "brand_entity_id", mam.key, "Pelikan maker identity"), ev("m300-series", "series_name", mam.key, "M300 heading"), ev("m300-release", "release_year", archive.key, "M300 chronology"), ev("m300-origin", "origin_country", mam.key, "official product field"), ev("m300-nib-field", "nib", archive.key, "14 ct nib row"), ev("m300-fill-field", "fill_system", mam.key, "piston filling product field"), ev("m300-material-field", "material", archive.key, "production color and trim"), ev("m300-dimensions", "dimensions", catalog.key, "M300 measurement table"), ev("m300-status", "status", archive.key, "production boundary")] },
  timeline: [{ key: "m300-start", title: "M300 进入 Souverän 小尺寸家族", eventType: "model_released", startDate: "1998", circa: true, description: "档案将 M300 路线置于约 1998 年起，黑色和绿条纹分别记录。", sourceKey: archive.key }, { key: "m300-black-end", title: "M300 黑色生产窗口结束", eventType: "discontinued", startDate: "2008", circa: true, description: "档案将黑色生产色记为约 1998–2008；绿条纹路线另行记录。", sourceKey: archive.key }],
  media: [{ key: "m300-factual-primary", title: svg.title, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图或颜色校样。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase284PelikanM300Packs: CuratedEntityPack[] = [brand, model];
