import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase139Groups } from "./phase139-german-swiss-current-batch";

const RETRIEVED = "2026-07-27";
export const PHASE288_CARAN_ID = "phase139-brand-caran-dache";
export const PHASE288_ECRIDOR_ID = "phase288-caran-dache-ecridor";
export const PHASE288_ECRIDOR_SLUG = "caran-dache-ecridor";
const SCOPE = "phase288-caran-dache-ecridor";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  itemType?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: input.itemType ?? "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

const collection = web({
  key: "phase288-ecridor-collection",
  title: "Caran d’Ache Ecridor Collection",
  url: "https://www.carandache.com/us/en/ecridor",
  registryKey: "caran-official-phase288",
  registryName: "Caran d’Ache official",
  summary: "官方集合页说明 Ecridor 的六角结构、日内瓦工坊、家族历史锚点，以及钢笔与其它书写工具的产品边界。",
});
const chevron = web({
  key: "phase288-ecridor-chevron",
  title: "Platinum-Coated ECRIDOR Chevron Fountain Pen",
  url: "https://www.carandache.com/us/en/fountain-pen-platinum-coated-ecridor-chevron-fountain-pen-p-10133.htm",
  registryKey: "caran-official-phase288",
  registryName: "Caran d’Ache official",
  summary: "官方 Chevron 页记录六面倒 V 雕刻、铂金涂层、钢尖尖幅以及 Caran d’Ache 墨囊或 piston ink pump。",
});
const avenue = web({
  key: "phase288-ecridor-avenue",
  title: "Platinum-Coated ECRIDOR Avenue Fountain Pen",
  url: "https://www.carandache.com/us/en/fountain-pen-platinum-coated-ecridor-avenue-fountain-pen-p-11141.htm",
  registryKey: "caran-official-phase288",
  registryName: "Caran d’Ache official",
  summary: "官方 Avenue 页记录鹅卵石 guilloché、哑光外观及 EF/F/M/B 商品变体。",
});
const brochure = web({
  key: "phase288-ecridor-brochure",
  title: "Caran d’Ache B2B brochure: Ecridor Collection",
  url: "https://www.carandache.com/content_files/pdf/B2B/brochure.pdf",
  registryKey: "caran-official-brochure-phase288",
  registryName: "Caran d’Ache official catalogue",
  tier: "contemporary_archive",
  itemType: "pdf",
  summary: "官方目录列黄铜六角体、柔性笔夹、钢尖、标准蓝色墨囊、F/M/B 边界、瑞士制造与多个雕刻纹样。",
});
const penChalet = web({
  key: "phase288-ecridor-penchalet",
  title: "Caran d’Ache Ecridor Fountain Pens",
  url: "https://www.penchalet.com/fine_pens/fountain_pens/caran_d_ache_ecridor_fountain_pen.html",
  registryKey: "penchalet-phase288",
  registryName: "Pen Chalet",
  sourceType: "retailer",
  tier: "professional_secondary",
  summary: "专业零售资料用于交叉核对 Ecridor 不同饰面和墨囊／转换器定位，不替代官方 SKU 字段。",
});
const diagram: CuratedSource = {
  key: "phase288-ecridor-diagram",
  registryKey: "fountain-pen-graph-editorial-phase288",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase288",
  title: "Caran d’Ache Ecridor identity factual SVG",
  url: "/images/library/site-original/phase288/caran-dache/ecridor.svg",
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  allowedUse: "store_full",
  license: "site-original",
  summary: "本站原创 factual SVG；非产品照片、非比例图、非颜色校样或品牌 Logo。",
  archiveUrl: "/images/library/site-original/phase288/caran-dache/ecridor.svg",
  archiveLocator: "project-public-asset:/images/library/site-original/phase288/caran-dache/ecridor.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900",
};

const existingBrand = phase139Groups.find((group) => group.brand.entityId === PHASE288_CARAN_ID)?.brand;
if (!existingBrand) throw new Error("Phase 288 Caran d’Ache brand pack missing.");

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
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, locator, scopeKey: SCOPE }],
  };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const model: CuratedEntityPack = {
  key: "phase288-caran-dache-ecridor-v1",
  entityId: PHASE288_ECRIDOR_ID,
  expectedType: "pen",
  expectedSlug: PHASE288_ECRIDOR_SLUG,
  canonicalName: "Caran d’Ache Ecridor",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/caran-dache-ecridor-phase288.md",
  storyTitle: "Caran d’Ache Ecridor：六角雕刻与瑞士钢尖路线",
  primarySourceKey: collection.key,
  depthTier: "A",
  aliases: [
    { alias: "Caran d’Ache Ecridor", language: "en", sourceKey: collection.key },
    { alias: "Ecridor Fountain Pen", language: "en", sourceKey: chevron.key },
    { alias: "卡达 Ecridor", language: "zh", sourceKey: collection.key },
  ],
  sources: [collection, chevron, avenue, brochure, penChalet, diagram],
  scopes: [{ key: SCOPE, scopeKey: SCOPE, market: "Ecridor fountain pen family; current and catalogue variants", productionState: "current", nibScope: "steel nib; EF/F/M/B vary by SKU and market", materialScope: "brass hexagonal body and cap; plated finish and guilloché vary", editionScope: "Chevron, Avenue, Retro, Damier and other pattern names remain separate version boundaries" }],
  claims: [
    claim("ecridor-identity", "model_identity", "Ecridor 是 Caran d’Ache 的独立六角书写工具家族，包含钢笔、圆珠笔、滚珠笔和自动铅笔。", collection.key, "Ecridor collection family description"),
    claim("ecridor-history", "production_history", "官方集合页把自动铅笔起点置于 1947 年、圆珠笔版本置于 1953 年；这里不把两组日期冒充钢笔具体上市年。", collection.key, "Ecridor family history dates"),
    claim("ecridor-body", "material_finish", "钢笔使用黄铜六角笔身与笔帽、柔性笔夹，表面可为铂金、镀金、玫瑰金或哑光黑，具体取决于纹样和 SKU。", brochure.key, "Ecridor characteristics, pages 16-17"),
    claim("ecridor-chevron", "version_boundary", "Chevron 在六个平面刻出倒 V 形 diamond engraving，并配铂金涂层；Avenue 的鹅卵石纹样与哑光表面是另一版本边界。", chevron.key, "Chevron body and Avenue guilloché descriptions"),
    claim("ecridor-nib", "nib", "Ecridor 钢笔采用钢尖；目录以 M 为标准，F/B 可按要求，当前地区商品页可见 EF/F/M/B 变体。", brochure.key, "Steel nib width and official SKU variants"),
    claim("ecridor-fill", "filling_system", "可使用 Caran d’Ache 墨囊或 piston ink pump 活塞式转换器；这不是内置活塞储墨笔。", chevron.key, "Cartridge or piston ink pump"),
    claim("ecridor-origin", "origin_country", "官方目录把 Ecridor 写作瑞士制造，并将设计与生产叙事放在日内瓦工坊。", brochure.key, "Made in Switzerland and Geneva workshop"),
    claim("ecridor-care", "maintenance_guidance", "换墨时先排空并用凉至温的清水吸排；溶剂、热水和过度拧紧都可能伤害涂层、密封件或螺纹。", penChalet.key, "Professional care and cartridge/converter boundary"),
    claim("ecridor-buying", "selection_guidance", "选购需核对纹样、表面、尖幅、商品编号、配件与产地；不能用 Ecridor 钢尖规格替代 Léman 的 18K 金尖规格。", collection.key, "Ecridor family versus Léman boundary", "editorial"),
  ],
  variants: [
    { key: "ecridor-chevron", name: "Chevron", notes: "六面倒 V 形雕刻，铂金涂层；官方页面列 EF/F/M/B 商品变体。", sourceKey: chevron.key, variantKind: "edition_group", market: "global" },
    { key: "ecridor-avenue", name: "Avenue", notes: "受日内瓦街道鹅卵石启发的 guilloché，哑光铂金表面；官方页面列 EF/F/M/B。", sourceKey: avenue.key, variantKind: "edition_group", market: "global" },
    { key: "ecridor-other-patterns", name: "Retro / Damier / Cubrik 等", notes: "官方目录中的其它纹样与表面名称；未在本包虚构统一的生产年份或尺寸。", sourceKey: brochure.key, variantKind: "edition_group", market: "catalogue" },
  ],
  spec: {
    brandEntityId: PHASE288_CARAN_ID,
    values: {
      series_name: "Caran d’Ache Ecridor fountain pen family",
      release_year: "Ecridor 家族：1947 自动铅笔、1953 圆珠笔；钢笔具体上市年未断言",
      origin_country: "瑞士制造；日内瓦工坊设计与生产",
      nib: "钢尖；M 为目录标准，F/B 可按要求，当前 SKU 可见 EF/F/M/B",
      fill_system: "Caran d’Ache 墨囊或 piston ink pump 转换器",
      material: "黄铜六角笔身与笔帽；铂金、镀金、玫瑰金或哑光黑表面依版本",
      status: "现行 Ecridor 家族入口；纹样、库存、尖幅和商品编号按地区与 SKU 变化",
    },
    evidence: [
      evidence("ecridor-brand", "brand_entity_id", collection.key, "Caran d’Ache Ecridor collection"),
      evidence("ecridor-series", "series_name", collection.key, "Ecridor family heading"),
      evidence("ecridor-release", "release_year", collection.key, "Ecridor family history dates"),
      evidence("ecridor-origin", "origin_country", brochure.key, "Made in Switzerland"),
      evidence("ecridor-nib-field", "nib", brochure.key, "Steel nib width M, F/B on request"),
      evidence("ecridor-fill-field", "fill_system", chevron.key, "Cartridge or piston ink pump"),
      evidence("ecridor-material-field", "material", brochure.key, "Hexagonal brass body and plated finishes"),
      evidence("ecridor-status", "status", collection.key, "Current collection and market-scoped variants"),
    ],
  },
  timeline: [
    { key: "ecridor-pencil", title: "Ecridor 自动铅笔家族锚点", eventType: "model_released", startDate: "1947", circa: false, description: "官方集合页把 Ecridor 自动铅笔起点放在 1947 年。", sourceKey: collection.key },
    { key: "ecridor-ballpoint", title: "Ecridor 圆珠笔版本锚点", eventType: "model_released", startDate: "1953", circa: false, description: "官方集合页把 Ecridor 圆珠笔版本放在 1953 年；钢笔具体上市年另待目录证据。", sourceKey: collection.key },
  ],
  media: [{ key: "ecridor-primary", title: diagram.title, sourceKey: diagram.key, localPath: diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非比例图、非颜色校样或品牌 Logo。", sourceUrl: diagram.url, usageStatus: "primary" }],
};

export const phase288CaranDacheEcridorPacks: CuratedEntityPack[] = [existingBrand, model];
