import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase38PelikanM200P457Packs } from "./phase38-pelikan-m200-p457";

const RETRIEVED = "2026-07-27";
export const PHASE280_PELIKAN_ID = "VXUULuCOLOB1";
export const PHASE280_M250_ID = "phase280-pelikan-m250";
export const PHASE280_M250_SLUG = "pelikan-m250";
const MODEL_SCOPE = "phase280-pelikan-m250";

function source(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  group: string;
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
    independenceGroup: input.group,
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

const archive = source({
  key: "phase280-pelikan-m250-archive",
  title: "Pelikan Collectibles：M200、M205 与 M250",
  url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Classic-Series/M200-Basis/index.html",
  registryKey: "pelikan-collectibles-phase280",
  registryName: "Pelikan Collectibles",
  sourceType: "official",
  tier: "contemporary_archive",
  group: "pelikan-collectibles-phase280",
  summary: "历史型号档案把 M250 Old Style 定位为 1985–1997 的 M200 外形金尖版本，并给出 14 ct、127 mm、12 mm、14 g 与约 1.20 ml 的参考值。",
  locator: "M250 (Old Style) section and measurement table",
});

const perch = source({
  key: "phase280-pelikan-m250-perch",
  title: "The Pelikan's Perch：M250",
  url: "https://thepelikansperch.com/database/fountain-pens/m2xx/m250/",
  registryKey: "the-pelikans-perch-phase280",
  registryName: "The Pelikan's Perch",
  sourceType: "blog",
  tier: "professional_secondary",
  group: "the-pelikans-perch-phase280",
  summary: "专业型号资料区分 M250 的 1997 前后饰件，并把产品线退出时间保守写为 2000 年代初约 2005 年。",
  locator: "M250 overview, pre-1997 and post-1997 trim sections, production boundary",
});

const nibArchive = source({
  key: "phase280-pelikan-nib-units",
  title: "Pelikan Collectibles：Screw-in nib units since 1929",
  url: "https://www.pelikan-collectibles.com/en/Pelikan/Nibs/Nib-units-since-1929/index.html",
  registryKey: "pelikan-collectibles-nibs-phase280",
  registryName: "Pelikan Collectibles",
  sourceType: "official",
  tier: "contemporary_archive",
  group: "pelikan-collectibles-nibs-phase280",
  summary: "笔尖档案说明 M250 标配 14 ct 金尖，同时提醒 M200、M250 与相邻型号的可换尖不等于整笔原厂身份相同。",
  locator: "M250 and nib-unit interchangeability passages",
});

const care = source({
  key: "phase280-pelikan-care-faq",
  title: "Pelikan FAQ：活塞钢笔上墨与清洗",
  url: "https://www.pelikan.com/int/products/writing/145-international/services/541-faq.html",
  registryKey: "pelikan-official-care-phase280",
  registryName: "Pelikan official site",
  sourceType: "official",
  tier: "primary",
  group: "pelikan-official-care-phase280",
  summary: "官方 FAQ 说明 Pelikan 活塞笔从瓶中吸墨、排空和清水清洁的基本路径；本页据此给出不强拆活塞的保守维护建议。",
  locator: "Fine writing instruments FAQ: piston filling and cleaning",
});

const svg: CuratedSource = {
  key: "phase280-pelikan-m250-svg",
  registryKey: "fountain-pen-graph-editorial-phase280",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase280",
  title: "Pelikan M250 identity boundary factual SVG",
  url: "/images/library/site-original/phase280/pelikan/m250.svg",
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  allowedUse: "store_full",
  license: "site-original",
  summary: "本站原创 factual SVG；示意图，非产品照片、非 Pelikan Logo、非比例图、非颜色校样。",
  archiveUrl: "/images/library/site-original/phase280/pelikan/m250.svg",
  archiveLocator: "project-public-asset:/images/library/site-original/phase280/pelikan/m250.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900",
};

const brand = structuredClone(phase38PelikanM200P457Packs[0]);
if (!brand || brand.entityId !== PHASE280_PELIKAN_ID) throw new Error("Phase 280 Pelikan brand pack missing.");
brand.key = "phase280-pelikan-brand-v1";

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedEntityPack["claims"][number] {
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

function specEvidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

const model: CuratedEntityPack = {
  key: "phase280-pelikan-m250-v1",
  entityId: PHASE280_M250_ID,
  expectedType: "pen",
  expectedSlug: PHASE280_M250_SLUG,
  canonicalName: "Pelikan M250",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pelikan-m250-phase280-publishable-content-2026-07-27.md",
  storyTitle: "Pelikan M250：Classic 200 外形里的金尖历史型号",
  primarySourceKey: archive.key,
  depthTier: "A",
  aliases: [
    { alias: "Pelikan M250", language: "en", sourceKey: archive.key },
    { alias: "Pelikan M 250", language: "en", sourceKey: archive.key },
    { alias: "百利金 M250", language: "zh", sourceKey: archive.key },
    { alias: "Pelikan #250", language: "en", sourceKey: nibArchive.key, market: "Japan" },
  ],
  sources: [archive, perch, nibArchive, care, svg],
  scopes: [{
    key: MODEL_SCOPE,
    scopeKey: MODEL_SCOPE,
    market: "Pelikan Classic 200 historical M250 records",
    productionState: "historical",
    nibScope: "14 ct/585 gold nib route; Japanese #250/#350 regional nib variants kept separate",
    materialScope: "resin body, transparent ink window and gold-coloured trim; colours and trim vary by period",
    editionScope: "1985–1997 Old Style and post-1997 M250 records; M200/M205/M215/P200/P205 excluded",
  }],
  claims: [
    claim("m250-identity", "model_identity", "Pelikan M250 是 Classic 200 外形里的独立金尖历史型号；它不能因与 M200 共用笔身比例就被合并。", archive.key, "M250 Old Style identity and M200 comparison"),
    claim("m250-nib", "nib", "M250 的原厂识别核心是 14 ct／585 金尖；日本 #250/#350 的 12 ct 地区编号另作变体，不把替换尖当成整笔身份。", nibArchive.key, "M250 standard nib and regional nib notes"),
    claim("m250-history", "production_history", "档案把 M250 Old Style 置于 1985–1997；后期资料仍记录同一金尖路线，约在 2000 年代初退出产品线，精确停产日未由官方公告确认。", perch.key, "production chronology and trim boundary"),
    claim("m250-fill", "filling_system", "M250 使用 Pelikan 内置差动活塞，从墨水瓶吸墨；它与 P200/P205、Twist P457 的墨囊体系分开。", care.key, "piston filling FAQ and Classic family boundary"),
    claim("m250-trim", "version_boundary", "1997 前后帽顶、帽环和活塞旋钮饰环发生改款；颜色、透明 demonstrator 与地区版本应按具体档案记录。", perch.key, "pre-1997 and post-1997 trim sections"),
    claim("m250-size", "physical_specification", "Old Style 档案参考值为闭合约 127 mm、直径约 12 mm、约 14.0 g、容量约 1.20 ml；不同年代与测量口径不应混作工厂公差。", archive.key, "M250 measurement table"),
    claim("m250-care", "maintenance_guidance", "换墨时用冷至温清水反复吸排，活塞卡滞、漏墨或裂纹时停止强拆，交由熟悉 Pelikan 结构的维修者处理。", care.key, "official cleaning path and conservative repair boundary", "editorial"),
    claim("m250-buying", "selection_guidance", "二手购买要同时核对 14C/585 尖刻、帽顶、帽环、尾钮、墨窗和活塞吸排；只看颜色或卖家标题不足以确认 M250。", perch.key, "model identification and variant boundary", "editorial"),
  ],
  variants: [
    { key: "m250-old-style", name: "M250 Old Style", notes: "1985–1997；derby 帽顶、常见两道帽环和 14 ct 单色金尖。", sourceKey: archive.key, variantKind: "edition_group", market: "global", productCode: "M250" },
    { key: "m250-post97", name: "M250 post-1997", notes: "后期改款路线；crown 帽顶、单帽环与旋钮饰环是常见线索，具体年份需以实物与档案交叉判断。", sourceKey: perch.key, variantKind: "edition_group", market: "global" },
    { key: "m250-japan-250", name: "Japan #250", notes: "地区编号的 12 ct 单色金尖版本；不把编号直接当成德国市场 M250 的同一货号。", sourceKey: nibArchive.key, variantKind: "market_sku", market: "Japan", productCode: "#250" },
    { key: "m250-japan-350", name: "Japan #350", notes: "地区编号的 12 ct 双色金尖版本；与 #250、14 ct M250 分开记录。", sourceKey: nibArchive.key, variantKind: "market_sku", market: "Japan", productCode: "#350" },
    { key: "m250-demonstrator", name: "Transparent / Amber Demonstrator", notes: "透明或琥珀 demonstrator 是具体版本，不代表所有 M250 都是透明笔身。", sourceKey: perch.key, variantKind: "edition_group", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE280_PELIKAN_ID,
    values: {
      series_name: "Classic 200 / M250",
      release_year: "1985；Old Style 1985–1997，后期路线约至 2000 年代初",
      origin_country: "德国品牌；具体制造地按当期目录和实物核对",
      nib: "14 ct／585 金尖；日本 #250/#350 为 12 ct 地区变体",
      fill_system: "内置差动活塞；瓶装墨水",
      material: "树脂笔杆、透明墨窗、金色饰件；颜色与版本依年代变化",
      dimensions: "Old Style 档案参考：闭合约 127 mm、直径约 12 mm、约 14.0 g、容量约 1.20 ml",
      status: "历史／停产型号；精确停产日未由官方公告确认",
    },
    evidence: [
      specEvidence("m250-brand", "brand_entity_id", archive.key, "Pelikan maker identity"),
      specEvidence("m250-series", "series_name", archive.key, "M250 Old Style heading"),
      specEvidence("m250-release", "release_year", archive.key, "1985–1997 production table"),
      specEvidence("m250-origin", "origin_country", archive.key, "Pelikan brand/archive context"),
      specEvidence("m250-nib-field", "nib", nibArchive.key, "14 ct M250 nib notes"),
      specEvidence("m250-fill-field", "fill_system", care.key, "piston filling and cleaning FAQ"),
      specEvidence("m250-material", "material", archive.key, "M200-shaped Classic construction"),
      specEvidence("m250-dimensions", "dimensions", archive.key, "M250 measurement table"),
      specEvidence("m250-status", "status", perch.key, "historical production boundary"),
    ],
  },
  timeline: [
    { key: "m250-introduced", title: "M250 进入 Classic 200 金尖路线", eventType: "model_released", startDate: "1985", circa: false, description: "M250 Old Style 与 M200 同形但以 14 ct 金尖区分。", sourceKey: archive.key },
    { key: "m250-redesign", title: "Classic 200 改款后的 M250", eventType: "design_milestone", startDate: "1997", circa: true, description: "后期帽顶、帽环与活塞旋钮饰环进入新的 trim 组合；不能把后期线索倒填到所有旧笔。", sourceKey: perch.key },
  ],
  media: [{
    key: "m250-factual-primary",
    title: svg.title,
    sourceKey: svg.key,
    localPath: svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片、非 Pelikan Logo、非比例图或颜色校样。",
    sourceUrl: svg.url,
    usageStatus: "primary",
  }],
};

export const phase280PelikanM250Packs: CuratedEntityPack[] = [brand, model];
