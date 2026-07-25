import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase165EversharpChiltonPacks } from "./phase165-eversharp-chilton";

const RETRIEVED = "2026-07-25";
export const PHASE190_EVERSHARP_BRAND_ID = "kFT81caNK3tP";
export const PHASE190_BANTAM_ID = "0TKGvP8286P4";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, independenceGroup: `${input.key}-group`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase190", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase190", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片，不证明颜色、比例、尖材、帽环或存世状态。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}

const S = {
  official: live({ key: "phase190-wahl-history", title: "Wahl-Eversharp 官方历史页", url: "https://wahl-eversharp.com/pages/history", registryName: "Wahl-Eversharp", sourceType: "official", tier: "primary", summary: "官方历史页说明 Wahl 通过 Boston Fountain Pen Company 进入钢笔业务，并延续 Wahl 与 Eversharp 品牌。", locator: "company history and entry into fountain pen business" }),
  fountainpenIt: live({ key: "phase190-eversharp-chronology", title: "FountainPen.it：Wahl Eversharp 年表", url: "https://www.fountainpen.it/Eversharp/en", registryName: "FountainPen.it", sourceType: "blog", tier: "professional_secondary", summary: "专业年表把 Bantam 放入 1933 年产品语境，并记录 Century of Progress 标记的版本边界。", locator: "1933 Bantam entry and company chronology" }),
  vintage: live({ key: "phase190-bantam-vintagepens", title: "Vintage Pens：Wahl-Eversharp Bantams", url: "https://www.vintagepens.com/Eversharp_Bantams.shtml", registryName: "Vintage Pens", sourceType: "retailer", tier: "professional_secondary", summary: "收藏档案展示 Bantam 的彩色纹理、尺寸差异与镀层磨损，适合作为版本和保存状态旁证。", locator: "Bantam colors, patterns, trim and condition notes" }),
  peyton: live({ key: "phase190-bantam-peyton", title: "Peyton Street Pens：Bantam bulb filler 单支档案", url: "https://www.peytonstreetpens.com/wahl-eversharp-bantam-fountain-pen-blue-swirl-bulb-filler-0-steel-nib-very-nice-restored.html", registryName: "Peyton Street Pens", sourceType: "retailer", tier: "retailer", summary: "专业零售档案记录一支蓝色旋纹 Bantam 的 bulb filler、0 号钢尖和修复状态；规格仅属于该支样本。", locator: "blue swirl Bantam, bulb filler, #0 steel nib and restoration" }),
  bulb: live({ key: "phase190-bulb-filler", title: "FountainPen.it：Bulb filler 原理", url: "https://www.fountainpen.it/Bulb_filler/en", registryName: "FountainPen.it", sourceType: "blog", tier: "professional_secondary", summary: "技术资料解释橡胶球、通气管和笔身储墨之间的关系，并将 Bantam 列为采用该系统的型号。", locator: "bulb filler mechanism and Eversharp Bantam reference" }),
  svg: diagram("phase190-bantam-svg", "Eversharp Bantam bulb filler 示意", "/images/library/site-original/phase190/eversharp/bantam.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.84, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const scope = "eversharp-bantam-model";

const pen: CuratedEntityPack = {
  key: "phase190-eversharp-bantam",
  entityId: PHASE190_BANTAM_ID,
  expectedType: "pen",
  expectedSlug: "the-eversharp-bantam",
  canonicalName: "The Eversharp Bantam",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/eversharp-bantam-phase190.md",
  storyTitle: "Eversharp Bantam：小尺寸与 bulb filler 的战前支线",
  primarySourceKey: S.fountainpenIt.key,
  depthTier: "A",
  aliases: [{ alias: "Eversharp Bantam", language: "en", sourceKey: S.fountainpenIt.key }, { alias: "Wahl-Eversharp Bantam", language: "en", sourceKey: S.vintage.key }, { alias: "Bantam bulb filler", language: "en", sourceKey: S.bulb.key }, { alias: "Eversharp Bantam 袖珍笔", language: "zh", sourceKey: S.peyton.key }],
  sources: [S.official, S.fountainpenIt, S.vintage, S.peyton, S.bulb, S.svg],
  scopes: [{ key: scope, scopeKey: "eversharp-bantam-identity-filler-and-versions", productionState: "historical", editionScope: "1930 年代 Bantam、小尺寸彩色赛璐珞、bulb filler、版本与维修边界" }],
  claims: [
    claim("eversharp-bantam-identity", "model_identity", "Eversharp Bantam 是 Wahl-Eversharp 产品线中的历史小型钢笔，不能仅凭短尺寸或 Eversharp 尖刻字认定版本。", S.fountainpenIt.key, scope, "Bantam chronology and identity"),
    claim("eversharp-bantam-date", "production_context", "公开年表把 Bantam 放在 1933 年产品语境，存世版本的具体年份仍需结合目录、刻字和实物。", S.fountainpenIt.key, scope, "1933 Bantam entry and Century of Progress boundary"),
    claim("eversharp-bantam-material", "material_variation", "Bantam 可见彩色或半透明赛璐珞、不同纹理和帽环组合；颜色与透明度不是全系统一规格。", S.vintage.key, scope, "Bantam cataloged colors and patterns"),
    claim("eversharp-bantam-filler", "filling_system", "Bantam 使用尾端盲帽下的 bulb filler，通过橡胶球和通气结构吸入墨水，不等同于杠杆、吸墨器或现代活塞。", S.bulb.key, scope, "bulb filler mechanism"),
    claim("eversharp-bantam-sample", "sample_specification", "专业零售样本记录蓝色旋纹、0 号钢尖和修复后的 bulb filler；这些是单支记录，不传播为全系规格。", S.peyton.key, scope, "single restored blue swirl sample"),
    claim("eversharp-bantam-care", "maintenance_guidance", "橡胶球老化、赛璐珞裂纹和镀层磨损是使用 Bantam 时的主要风险，应先清水测试并交给历史钢笔修复者。", S.vintage.key, scope, "trim loss and vintage material care boundary"),
  ],
  variants: [{ key: "eversharp-bantam-round", name: "圆杆版本", notes: "公开收藏图录显示圆杆 Bantam；闭盖长度、环数和颜色仍按单支核对。", sourceKey: S.vintage.key, variantKind: "variant" }, { key: "eversharp-bantam-faceted", name: "棱面杆版本", notes: "公开收藏图录显示棱面或几何纹理版本，不把纹理名当作统一年代。", sourceKey: S.vintage.key, variantKind: "variant" }, { key: "eversharp-bantam-nib", name: "金尖或镀金钢尖样本", notes: "零售与收藏档案可见不同尖材；尖号和金含量必须拍摄刻字确认。", sourceKey: S.peyton.key, variantKind: "nib" }, { key: "eversharp-bantam-century", name: "Century of Progress 标记样本", notes: "年表记录 1933 年展览标记语境；不是所有 Bantam 的共同配置。", sourceKey: S.fountainpenIt.key, variantKind: "edition_group" }],
  spec: {
    brandEntityId: PHASE190_EVERSHARP_BRAND_ID,
    values: { series_name: "Eversharp Bantam", origin_country: "美国；Wahl-Eversharp 芝加哥产品线，具体样本按刻字与目录核对", nib: "公开样本可见金尖或镀金钢尖；尖号、金含量和调校按实物确认", fill_system: "尾端盲帽下的 bulb filler；橡胶球、通气与密封状态决定能否吸墨", material: "彩色或半透明赛璐珞，黑色握位与镀金饰件按版本确认", dimensions: "小型袖珍笔；闭盖长度、直径和帽环数量按单支测量", weight: "未建立统一工厂重量；帽环、夹子、墨水与修复件会改变实物重量", status: "历史型号；约 1930 年代至 1940 年前后，版本与存世状态按单支核对" },
    evidence: [ev("eversharp-bantam", "brand_entity_id", S.official.key, scope, "Wahl-Eversharp brand history"), ev("eversharp-bantam", "series_name", S.fountainpenIt.key, scope, "Bantam chronology"), ev("eversharp-bantam", "origin_country", S.official.key, scope, "Chicago company history"), ev("eversharp-bantam", "nib", S.peyton.key, scope, "single sample steel nib"), ev("eversharp-bantam", "fill_system", S.bulb.key, scope, "bulb filler mechanism"), ev("eversharp-bantam", "material", S.vintage.key, scope, "celluloid colors and trim"), ev("eversharp-bantam", "dimensions", S.vintage.key, scope, "small pen and version measurement boundary"), ev("eversharp-bantam", "weight", S.peyton.key, scope, "no unified factory weight"), ev("eversharp-bantam", "status", S.fountainpenIt.key, scope, "historical chronology")],
  },
  media: [{ key: "eversharp-bantam-primary", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表颜色、比例、尖材、帽环或存世状态。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

const eversharpBrand = phase165EversharpChiltonPacks.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE190_EVERSHARP_BRAND_ID);
if (!eversharpBrand) throw new Error("Phase 190 requires the existing curated Eversharp brand pack.");

export const phase190EversharpBantamPacks: CuratedEntityPack[] = [eversharpBrand, pen];
