import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase186WingsungPacks } from "./phase186-wingsung-601";

const RETRIEVED = "2026-07-25";
export const PHASE196_WINGSUNG_BRAND_ID = "5WJw8padPmKF";
export const PHASE196_236_ID = "GeaqwunJjrpS";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, independenceGroup: `${input.key}-group`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase196", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase196", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片，不证明真实颜色、比例、材质、尖号、墨囊或批次。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}

const S = {
  fpn: live({ key: "phase196-wingsung-236-fpn", title: "Fountain Pen Network：Wing Sung 612 & 236", url: "https://www.fountainpennetwork.com/forum/topic/201561-wing-sung-612-236/", registryName: "Fountain Pen Network reviewers", sourceType: "forum", tier: "professional_secondary", summary: "论坛实物记录明确把酒红色笔标为 Wing Sung 236，并称它是很好写的老库存笔；不提供统一厂规尺寸。", locator: "2011 review: burgundy pen identified as Wing Sung 236; later comment calls 236 a very nice writer" }),
  sina: live({ key: "phase196-wingsung-236-sina", title: "新浪众测：18支入门钢笔横评", url: "https://zhongce.sina.com.cn/article/view/4262", registryName: "新浪众测作者", sourceType: "blog", tier: "professional_secondary", summary: "中文实测写 233 的老式包尖、墨窗和挤压上墨器，并把 234、235、236、237 作为 23X 家族列举；不能把 233 规格直接转给 236。", locator: "section 9: Yongsheng 233, 23X family mention and store-copy boundary" }),
  baidu: live({ key: "phase196-wingsung-236-baidu", title: "百度经验：永生有哪些好钢笔", url: "https://jingyan.baidu.com/article/d7130635fa447652fcf4751f.html", registryName: "百度经验作者", sourceType: "blog", tier: "professional_secondary", summary: "型号梳理提示 234、235、236 的尖安装方式不完全相同，并区分 235 金属网格杆身；用于保留型号边界。", locator: "2022 model roundup: 23X family, 234/235/236 nib and material distinction" }),
  bilibili: live({ key: "phase196-wingsung-236-bilibili", title: "Bilibili：Fountain pen review 176 Wingsung 永生 236", url: "https://www.bilibili.com/video/BV1E5411W79y/", registryName: "Bilibili uploader", sourceType: "blog", tier: "professional_secondary", summary: "视频标题和页面信息确认存在以 Wingsung 236 为主题的独立评测；页面未公开统一厂规规格，因此不用于填具体数值。", locator: "video title and publication metadata: 2020-06-24 Wingsung 236 review" }),
  hero: live({ key: "phase196-hero-official-story", title: "Hero 官方：Our Story", url: "https://www.hero-light.com/en/list-18-1.html", registryName: "Shanghai Hero", sourceType: "official", tier: "primary", summary: "Hero 官方品牌史提供中国钢笔制造语境；不从该页推断 236 的具体工厂、年份或规格。", locator: "Our Story: Chinese fountain-pen brand context" }),
  svg: diagram("phase196-wingsung-236-svg", "永生 WingSung 236 老库存示意", "/images/library/site-original/phase196/wingsung/236.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.8, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const scope = "wingsung-236-model";
const pen: CuratedEntityPack = {
  key: "phase196-wingsung-236",
  entityId: PHASE196_236_ID,
  expectedType: "pen",
  expectedSlug: "永生-wingsung-236",
  canonicalName: "永生 WingSung 236",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wingsung-236-phase196.md",
  storyTitle: "永生 WingSung 236：23X 大包头尖系列里的老库存书写样本",
  primarySourceKey: S.fpn.key,
  depthTier: "A",
  aliases: [{ alias: "Wing Sung 236", language: "en", sourceKey: S.fpn.key }, { alias: "WingSung 236", language: "en", sourceKey: S.bilibili.key }, { alias: "Yongsheng 236", language: "en", sourceKey: S.baidu.key }, { alias: "永生 236", language: "zh", sourceKey: S.sina.key }],
  sources: [S.fpn, S.sina, S.baidu, S.bilibili, S.hero, S.svg],
  scopes: [{ key: scope, scopeKey: "wingsung-236-23x-identity-and-care", productionState: "historical", editionScope: "公开论坛、中文型号梳理和视频标题可核实的永生 236 老型号、23X 家族边界、老库存验收与维护" }],
  claims: [
    claim("wingsung-236-identity", "model_identity", "Wing Sung 236 是永生／WingSung 23X 老型号中的独立编号；海外实物记录将酒红色样本明确标为 236，不能与 612 合并。", S.fpn.key, scope, "burgundy sample identified as Wing Sung 236; separate black 612"),
    claim("wingsung-236-family", "series_boundary", "中文资料把 234、235、236、237 与 233 放在 23X 家族语境中，但 233 的墨窗、挤压器或写感不能直接当成 236 的统一规格。", S.sina.key, scope, "23X family list and 233-specific user observations"),
    claim("wingsung-236-nib", "nib_boundary", "236 可放在大包头尖家族的检索语境中；尖号、线宽、阻尼和磨耗属于单支验收项，公开资料没有统一厂规尖号。", S.baidu.key, scope, "23X nib family and model-specific installation differences"),
    claim("wingsung-236-filling", "filling_system_boundary", "公开资料只足以提示 23X 家族可能出现墨窗与老式挤压上墨器；236 当前样本的上墨件、接口和是否后配必须按实物确认。", S.sina.key, scope, "233 filling observations kept separate from 236"),
    claim("wingsung-236-care", "maintenance_guidance", "老库存应先清水试漏、低量装墨并检查橡胶件、帽口、刻字和杆身裂纹；发现挤压器失弹或漏墨时停止加力。", S.baidu.key, scope, "cleaning guidance and metal/old-stock care"),
    claim("wingsung-236-selection", "selection_guidance", "购买时要同时核对 236 刻字、酒红色样本线索、笔尖包头、帽盖、笔夹和上墨器；只写 23X 的商品应视为待确认家族件。", S.fpn.key, scope, "physical identity and old-stock selection boundary"),
  ],
  variants: [{ key: "wingsung-236-burgundy-sample", name: "酒红色公开实物样本", notes: "FPN 记录中的酒红色 236；不证明 236 的唯一配色或统一材料。", sourceKey: S.fpn.key, variantKind: "edition_group" }, { key: "wingsung-236-23x-family", name: "23X 家族语境", notes: "与 233、234、235、237 并列的型号谱系线索；邻近型号规格不互换。", sourceKey: S.sina.key, variantKind: "edition_group" }, { key: "wingsung-236-old-stock", name: "老库存／二手状态", notes: "橡胶件、帽口、镀层和尖端状态按单支核验。", sourceKey: S.fpn.key, variantKind: "variant" }],
  spec: {
    brandEntityId: PHASE196_WINGSUNG_BRAND_ID,
    values: { series_name: "WingSung 236 / 永生 236", origin_country: "中国；公开资料提供品牌与老型号语境，具体生产主体、年份和批次按实物核对", nib: "23X 家族的大包头尖语境；236 的具体尖号、线宽和调校按单支验收", fill_system: "公开资料常将 23X 家族与墨窗、老式挤压上墨器并列；236 单支的上墨件和接口需实物确认", material: "公开样本以酒红色杆身出现；材质、帽盖和镀层随批次与保存状态核验", dimensions: "未找到可靠统一厂规尺寸；二手或老库存应按合盖、未插帽和插帽状态自行测量", weight: "未找到可靠统一公开重量；帽盖、金属件、上墨器和装墨状态会改变单支测量", status: "历史流通／老库存型号；现行生产与配件供应状态不明，按卖家和实物核对" },
    evidence: [ev("wingsung-236", "brand_entity_id", S.hero.key, scope, "brand context"), ev("wingsung-236", "series_name", S.fpn.key, scope, "236 identity"), ev("wingsung-236", "origin_country", S.hero.key, scope, "Chinese brand context"), ev("wingsung-236", "nib", S.baidu.key, scope, "23X nib boundary"), ev("wingsung-236", "fill_system", S.sina.key, scope, "family vs 236 filling boundary"), ev("wingsung-236", "material", S.fpn.key, scope, "burgundy sample and old-stock surface"), ev("wingsung-236", "dimensions", S.fpn.key, scope, "no factory dimensions in review"), ev("wingsung-236", "weight", S.fpn.key, scope, "no factory weight in review"), ev("wingsung-236", "status", S.fpn.key, scope, "historic circulation and old stock")],
  },
  media: [{ key: "wingsung-236-primary", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表真实颜色、比例、材质、尖号、墨囊或生产批次。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

const existingBrand = phase186WingsungPacks.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE196_WINGSUNG_BRAND_ID);
if (!existingBrand) throw new Error("Phase 196 requires the existing curated WingSung brand pack.");
const brandOfficialSource = existingBrand.sources.find((source) => source.sourceType === "official");
if (!brandOfficialSource) throw new Error("Phase 196 requires the existing WingSung official history source.");
pen.sources = [...pen.sources, brandOfficialSource];

export const phase196Wingsung236Packs: CuratedEntityPack[] = [existingBrand, pen];
