import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase38PelikanM200P457Packs } from "./phase38-pelikan-m200-p457";

const RETRIEVED = "2026-07-27";
export const PHASE281_PELIKAN_ID = "VXUULuCOLOB1";
export const PHASE281_M205_ID = "phase281-pelikan-m205";
export const PHASE281_M215_ID = "phase281-pelikan-m215";
export const PHASE281_M205_SLUG = "pelikan-m205";
export const PHASE281_M215_SLUG = "pelikan-m215";

function source(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; group: string; summary: string; locator: string; itemType?: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType, tier: input.tier, independenceGroup: input.group, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: input.itemType ?? "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

const catalog = source({ key: "phase281-pelikan-fine-writing-catalog", title: "Pelikan Fine Writing Instruments catalogue 2025", url: "https://www.pelikan.com/images/assets/catalogs/2025/2025_CATALOGO_FWI.pdf", registryKey: "pelikan-fine-writing-phase281", registryName: "Pelikan Fine Writing official", sourceType: "official", tier: "primary", group: "pelikan-fine-writing-phase281", summary: "官方目录区分 Classic 200 活塞款与 P200/P205 墨囊款，并提供 M205 的银色饰件、抛光不锈钢尖与测量口径。", locator: "Classic 200 pages: M200/M205 piston, P200/P205 cartridge, nib and dimensions", itemType: "pdf" });
const m205Pdp = source({ key: "phase281-pelikan-m205-pdp", title: "Pelikan M205 Black M product record", url: "https://mam.pelikan.com/mam/en/pelikan/products/971986", registryKey: "pelikan-mam-phase281", registryName: "Pelikan official product archive", sourceType: "official", tier: "primary", group: "pelikan-mam-phase281", summary: "官方产品资料确认 M205 的活塞、抛光不锈钢尖、银色镀铬饰件与 Classic 200 身份。", locator: "M205 Black M product identity, piston, polished stainless nib and silver trim" });
const m215Pdp = source({ key: "phase281-pelikan-m215-pdp", title: "Pelikan M215 Black-Rings M product record", url: "https://mam.pelikan.com/mam/en/pelikan/products/948281", registryKey: "pelikan-mam-phase281", registryName: "Pelikan official product archive", sourceType: "official", tier: "primary", group: "pelikan-mam-phase281", summary: "官方产品资料确认 M215 的黄铜笔杆、树脂外壳、抛光不锈钢尖、银色镀铬饰件与活塞。", locator: "M215 Black-Rings M product identity, brass barrel, resin shell and piston" });
const archive = source({ key: "phase281-pelikan-classic-archive", title: "Pelikan Collectibles：M200、M205 与 M215", url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Classic-Series/M200-Basis/index.html", registryKey: "pelikan-collectibles-phase281", registryName: "Pelikan Collectibles", sourceType: "official", tier: "contemporary_archive", group: "pelikan-collectibles-phase281", summary: "专业型号档案按颜色、年代与结构区分 M205/M215，给出 M205 的银色饰件、M215 的黄铜笔杆与参考尺寸重量。", locator: "M205 and M215 sections, production variants, trim and measurement tables" });
const perch = source({ key: "phase281-pelikan-m200-perch", title: "The Pelikan's Perch：M200 family", url: "https://thepelikansperch.com/database/fountain-pens/m2xx/m200/", registryKey: "the-pelikans-perch-phase281", registryName: "The Pelikan's Perch", sourceType: "blog", tier: "professional_secondary", group: "the-pelikans-perch-phase281", summary: "专业资料补充 Classic 200 家族的年代改款、M205/M215 版本边界和历史尺寸口径。", locator: "M200 family trim, M205/M215 variants and historical measurements" });
const care = source({ key: "phase281-pelikan-care-faq", title: "Pelikan FAQ：活塞钢笔上墨与清洗", url: "https://www.pelikan.com/int/products/writing/145-international/services/541-faq.html", registryKey: "pelikan-official-care-phase281", registryName: "Pelikan official site", sourceType: "official", tier: "primary", group: "pelikan-official-care-phase281", summary: "官方 FAQ 说明 Pelikan 活塞笔从瓶中吸墨、排空与清水清洁的基本路径。", locator: "Fine writing instruments FAQ: piston filling and cleaning" });

function svg(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase281", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase281", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}

const m205Svg = svg("phase281-pelikan-m205-svg", "Pelikan M205 identity boundary factual SVG", "/images/library/site-original/phase281/pelikan/m205.svg");
const m215Svg = svg("phase281-pelikan-m215-svg", "Pelikan M215 identity boundary factual SVG", "/images/library/site-original/phase281/pelikan/m215.svg");
const brand = structuredClone(phase38PelikanM200P457Packs[0]);
if (!brand || brand.entityId !== PHASE281_PELIKAN_ID) throw new Error("Phase 281 Pelikan brand pack missing.");
brand.key = "phase281-pelikan-brand-v1";

function claim(scopeKey: string, key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.97 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, locator, scopeKey }] };
}
function ev(scopeKey: string, key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string) { return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true }; }

function model(input: { id: string; slug: string; name: string; markdownFile: string; title: string; summary: string; pdp: CuratedSource; svg: CuratedSource; material: string; dimensions: string; release: string; status: string; variants: CuratedEntityPack["variants"]; }) : CuratedEntityPack {
  const scopeKey = `phase281-${input.slug}`;
  return {
    key: `phase281-${input.slug}-v1`, entityId: input.id, expectedType: "pen", expectedSlug: input.slug, canonicalName: input.name, publicationIntent: "publish", publicationBlockers: [], markdownFile: input.markdownFile, storyTitle: input.title, primarySourceKey: input.pdp.key, depthTier: "A",
    aliases: [{ alias: input.name, language: "en", sourceKey: input.pdp.key }, { alias: `百利金 ${input.name.replace("Pelikan ", "")}`, language: "zh", sourceKey: input.pdp.key }],
    sources: [catalog, input.pdp, archive, perch, care, input.svg],
    scopes: [{ key: scopeKey, scopeKey, market: "Pelikan Classic 200 family", productionState: input.status.includes("历史") ? "historical" : "current", materialScope: input.material, editionScope: "型号路线；颜色、图案和地区 SKU 按 variant 记录，M200/M250/P200/P205 排除" }],
    claims: [
      claim(scopeKey, `${input.slug}-identity`, "model_identity", input.summary, input.pdp.key, "official product identity"),
      claim(scopeKey, `${input.slug}-boundary`, input.slug === PHASE281_M205_SLUG ? "version_boundary" : "material_finish", input.slug === PHASE281_M205_SLUG ? "M205 是银色饰件活塞钢笔；M200、M250 与 P205 分别代表不同饰件、尖材或上墨系统。" : "M215 以黄铜笔杆和更高重量区别于 M200/M205；它仍是钢尖活塞笔，不是 M250 金尖或 P205 墨囊笔。", archive.key, "M205/M215 family boundary"),
      claim(scopeKey, `${input.slug}-fill`, "filling_system", "内置差动活塞，从墨水瓶吸墨；不要把 P200/P205 的墨囊结构写入本型号。", care.key, "piston filling FAQ"),
      claim(scopeKey, `${input.slug}-history`, "production_history", `${input.name} 的年代、图案和结构版本必须按 Classic 200 家族档案分开记录，不把 M200、M250 或 P205 的历史复制过来。`, perch.key, "professional family chronology and model boundary"),
      claim(scopeKey, `${input.slug}-care`, "maintenance_guidance", "换墨时用冷至温清水反复吸排，活塞卡滞、漏墨或裂纹时停止强拆并交由专业维修者。", care.key, "official care path", "editorial"),
      claim(scopeKey, `${input.slug}-buying`, "selection_guidance", input.slug === PHASE281_M205_SLUG ? "购买时核对银色饰件、抛光钢尖、尾部活塞和具体颜色货号；不要把 P205 墨囊笔当成 M205。" : "购买时核对黄铜笔杆、图案、约 20 g 的重量线索、抛光钢尖和活塞行程；不要只凭银色夹子认型号。", perch.key, "family identification and selection boundary", "editorial"),
    ],
    variants: input.variants,
    spec: { brandEntityId: PHASE281_PELIKAN_ID, values: { series_name: input.name, release_year: input.release, origin_country: "德国品牌；具体制造地按当期目录与实物核对", nib: input.slug === PHASE281_M205_SLUG ? "抛光不锈钢尖；EF/F/M/B 依目录与 SKU" : "抛光不锈钢尖；EF/F/M/B 依目录与 SKU", fill_system: "内置差动活塞；瓶装墨水", material: input.material, dimensions: input.dimensions, status: input.status }, evidence: [ev(scopeKey, `${input.slug}-brand`, "brand_entity_id", input.pdp.key, "Pelikan maker identity"), ev(scopeKey, `${input.slug}-series`, "series_name", input.pdp.key, "official model heading"), ev(scopeKey, `${input.slug}-release`, "release_year", archive.key, "production chronology"), ev(scopeKey, `${input.slug}-origin`, "origin_country", input.pdp.key, "brand/product context"), ev(scopeKey, `${input.slug}-nib`, "nib", input.pdp.key, "nib and width field"), ev(scopeKey, `${input.slug}-fill`, "fill_system", input.pdp.key, "piston field"), ev(scopeKey, `${input.slug}-material`, "material", input.pdp.key, "material and trim field"), ev(scopeKey, `${input.slug}-dimensions`, "dimensions", archive.key, "historical measurement table"), ev(scopeKey, `${input.slug}-status`, "status", archive.key, "production/current boundary")] },
    timeline: [{ key: `${input.slug}-route`, title: `${input.name} 进入 Classic 200 路线`, eventType: "model_released", startDate: input.release.split(/[–-]/)[0] ?? input.release, circa: true, description: input.summary, sourceKey: archive.key }],
    media: [{ key: `${input.slug}-factual-primary`, title: input.svg.title, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图或颜色校样。", sourceUrl: input.svg.url, usageStatus: "primary" }],
  };
}

const m205 = model({ id: PHASE281_M205_ID, slug: PHASE281_M205_SLUG, name: "Pelikan M205", markdownFile: ".planning/content-research/pelikan-m205-phase281-publishable-content-2026-07-27.md", title: "Pelikan M205：Classic 200 的银色饰件活塞路线", summary: "Pelikan M205 是 Classic 200 家族的银色／铑色饰件活塞钢笔，配抛光不锈钢尖；它不是金尖 M250，也不是外形相近的墨囊 P205。", pdp: m205Pdp, svg: m205Svg, material: "树脂笔杆、透明墨窗、银色／铑色饰件", dimensions: "当前目录约 14.7 cm、12.3 mm、14 g、约 1.3–1.4 ml；旧式档案约 125 mm、12 mm、1.20 ml", release: "约 2005 起", status: "Classic 200 活塞型号；地区配色与库存变化", variants: [
  { key: "m205-silver", name: "M205 Silver trim", notes: "银色／铑色饰件与抛光不锈钢尖构成型号主边界。", sourceKey: m205Pdp.key, variantKind: "edition_group", market: "global" },
  { key: "m205-colors", name: "Black / Red / White and transparent variants", notes: "颜色、透明度和特别版本属于 M205 变体，不新增基础实体。", sourceKey: archive.key, variantKind: "color", market: "global" },
] });
const m215 = model({ id: PHASE281_M215_ID, slug: PHASE281_M215_SLUG, name: "Pelikan M215", markdownFile: ".planning/content-research/pelikan-m215-phase281-publishable-content-2026-07-27.md", title: "Pelikan M215：黄铜笔杆的 Classic 200 sibling", summary: "Pelikan M215 是 Classic 200 家族的金属笔杆 sibling：黄铜笔杆加树脂外壳、银色镀铬饰件和抛光不锈钢尖，使它明显重于 M200/M205；它仍是瓶装活塞笔。", pdp: m215Pdp, svg: m215Svg, material: "黄铜笔杆、树脂外壳、银色镀铬饰件", dimensions: "档案参考：闭合约 125 mm、直径约 12 mm、约 20.0 g、容量约 1.20 ml", release: "2005 起", status: "Classic 200 历史／地区在售资料并存；库存按地区核对", variants: [
  { key: "m215-black-rings", name: "Black-Rings", notes: "黄铜笔杆、树脂外壳与银色环；官方 SKU 948281 的身份锚点。", sourceKey: m215Pdp.key, variantKind: "edition_group", market: "global", productCode: "948281" },
  { key: "m215-patterns", name: "Blue Stripes / Rings / Lozenges / Rectangles", notes: "图案是 M215 的历史版本，不把不同纹样拆成多个基础型号。", sourceKey: archive.key, variantKind: "color", market: "global" },
] });

export const phase281PelikanM205M215Packs: CuratedEntityPack[] = [brand, m205, m215];
