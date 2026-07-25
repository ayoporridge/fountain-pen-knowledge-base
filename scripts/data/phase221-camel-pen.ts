import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-25";
export const PHASE221_CAMEL_BRAND_ID = "phase221-brand-camel-pen-company";
export const PHASE221_CAMEL_BRAND_SLUG = "camel-pen-company";
export const PHASE221_CAMEL_ID = "6fuk7c89phvQ";
export const PHASE221_CAMEL_SLUG = "the-camel-pen";

function web(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string; independenceGroup: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase221", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase221", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, summary: "本站原创 factual SVG；结构示意，非产品照片，不证明真实比例、模具、颗粒形状、广告或统一规格。", allowedUse: "store_full", license: "site-original", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}
const S = {
  redeem: web({ key: "phase221-camel-redeem", title: "Redeemed Pens：The Camel Pen Restoration", url: "https://blog.redeempens.com/2022/03/the-camel-pen-restoration.html", registryName: "Redeemed Pens", sourceType: "blog", tier: "professional_secondary", independenceGroup: "phase221-redeem-pens", summary: "修复记录说明干墨颗粒、加水、button filler 退路、Camel 14K 样本与内部低间隙机构风险。", locator: "history, dry ink pellets, button-filler fallback, restoration and Camel 14K sample" }),
  penhero: web({ key: "phase221-camel-penhero", title: "PenHero：Secretary Fountain Pen c. 1944–1945（Camel 时间线）", url: "https://www.penhero.com/PenGallery/Secretary/Secretary1944.htm", registryName: "PenHero", sourceType: "blog", tier: "professional_secondary", independenceGroup: "phase221-penhero-secretary-camel", summary: "广告、公司登记、火灾和 Camel—Newark—Secretary 过渡时间线，区分推断与确定事实。", locator: "Camel incorporation, 1936-1938 ads, 1943 fire and company transition" }),
  fountainPenIt: web({ key: "phase221-camel-fountainpenit", title: "FountainPen.it：Minor American manufacturers — Camel", url: "https://www.fountainpen.it/Produttori_minori_americani", registryName: "FountainPen.it", sourceType: "blog", tier: "professional_secondary", independenceGroup: "phase221-fountainpenit-camel", summary: "小厂目录把 Camel 置于 1935—1938 年，并指向固体墨专利和 Joseph Wustman。", locator: "Camel company window, Joseph Wustman and soluble ink patent references" }),
  patent: web({ key: "phase221-camel-patent", title: "Google Patents：US2030452A soluble ink fountain pen", url: "https://patents.google.com/patent/US2030452/en", registryName: "United States patent record", sourceType: "patent", tier: "primary", summary: "固体／可溶墨钢笔专利记录，用于机制史；专利主体与商品品牌关系分开处理。", locator: "US2030452A soluble ink fountain pen; patent mechanism context" , independenceGroup: "phase221-google-patents-us2030452"}),
  brandSvg: diagram("phase221-camel-brand-svg", "Camel Pen Company 品牌与干墨路线示意", "/images/library/site-original/phase221/camel/camel-brand.svg"),
  modelSvg: diagram("phase221-camel-model-svg", "Camel Pen 干墨腔与 button filler 示意", "/images/library/site-original/phase221/camel/camel-pen.svg"),
} as const;
const brandScope = "camel-brand-scope";
const modelScope = "camel-pen-scope";
function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string, extra: string[] = []): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.85, sourceKey, locator, evidence: [sourceKey, ...extra].map((evidenceSource, index) => ({ key: `${key}-evidence-${index + 1}`, sourceKey: evidenceSource, scopeKey, locator })) };
}
function specEvidence(fieldKey: SpecFieldKey, sourceKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `phase221-camel-${fieldKey}`, fieldKey, sourceKey, scopeKey: modelScope, locator };
}

const brand: CuratedEntityPack = {
  key: "phase221-camel-brand", entityId: PHASE221_CAMEL_BRAND_ID, expectedType: "brand", expectedSlug: PHASE221_CAMEL_BRAND_SLUG, canonicalName: "Camel Pen Company", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/camel-pen-company-brand-phase221.md", storyTitle: "Camel Pen Company：干墨颗粒钢笔的小厂路线", primarySourceKey: S.penhero.key, depthTier: "B",
  aliases: [{ alias: "Camel Pen Company", language: "en", sourceKey: S.penhero.key }, { alias: "Camel Pen Co.", language: "en", sourceKey: S.fountainPenIt.key }, { alias: "Camel", language: "en", sourceKey: S.redeem.key }],
  sources: [S.redeem, S.penhero, S.fountainPenIt, S.patent, S.brandSvg], scopes: [{ key: brandScope, scopeKey: brandScope, productionState: "historical", editionScope: "Camel Pen Company 品牌入口；干墨颗粒钢笔与后续 Newark／Secretary 关系分开记录。" }],
  claims: [
    claim("camel-brand-identity", "brand_identity", "Camel Pen Company 是 1930 年代新泽西的小型美国制笔公司，资料把 Joseph Wustman 与品牌建立相连；完整公司史仍不完备。", S.penhero.key, brandScope, "company timeline and Wustman", [S.redeem.key, S.fountainPenIt.key]),
    claim("camel-solid-ink", "technology_history", "Camel 的代表路线把干墨颗粒放在笔身腔室，加水形成可写墨水；这属于商品机制和广告语境，不等于现代墨水容量保证。", S.redeem.key, brandScope, "dry ink pellets and add-water concept", [S.patent.key]),
    claim("camel-window", "production_window", "公开资料把 Camel 置于约 1935—1938 年，广告、公司注册、专利和实物制造日期分开处理。", S.penhero.key, brandScope, "1935 incorporation and 1936-1938 advertising", [S.fountainPenIt.key]),
    claim("camel-lineage", "identity_boundary", "Camel、Newark 和 Secretary 的人员与设备关系可建立来源化 lineage，但后期 Secretary 规格不能倒填到 Camel。", S.penhero.key, brandScope, "Camel-Newark-Secretary transition with uncertainty", [S.redeem.key]),
    claim("camel-maintenance", "maintenance_guidance", "低间隙内部支撑、干墨残留、赛璐珞和 sac 让拆解风险高；维护应以可逆、低压和熟悉早期机构为前提。", S.redeem.key, brandScope, "restoration risks and internal brace", [S.penhero.key]),
    claim("camel-selection", "selection_guidance", "购买时核对干墨腔、button、内部支撑、裂纹、笔尖刻字和修复记录；它更适合收藏和机制研究。", S.redeem.key, brandScope, "condition and collector guidance", [S.penhero.key]),
  ],
  variants: [{ key: "camel-solid-ink-line", name: "Camel 干墨颗粒路线", notes: "品牌代表产品；颗粒、button filler 退路和饰件按具体样本核对。", sourceKey: S.redeem.key, variantKind: "edition_group" }],
  media: [{ key: "camel-brand-primary", title: S.brandSvg.title, sourceKey: S.brandSvg.key, localPath: S.brandSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；品牌导航示意，非产品照片，不代表真实比例、Logo、广告或完整目录。", sourceUrl: S.brandSvg.url, usageStatus: "primary" }],
  timeline: [{ key: "camel-1935-founded", title: "Camel Pen Company 在新泽西进入公司与产品记录", eventType: "brand_founded", startDate: "1935", circa: true, description: "PenHero、FountainPen.it 和修复资料共同支持 1935 年附近的品牌窗口。", sourceKey: S.penhero.key }, { key: "camel-1936-ads", title: "干墨颗粒 Camel 钢笔进入广告销售窗口", eventType: "model_released", startDate: "1936", circa: true, description: "1936—1937 年广告资料与固体墨机制共同构成产品窗口；具体 SKU 不做统一推断。", sourceKey: S.penhero.key }],
};

const model: CuratedEntityPack = {
  key: "phase221-camel-pen", entityId: PHASE221_CAMEL_ID, expectedType: "pen", expectedSlug: PHASE221_CAMEL_SLUG, canonicalName: "The Camel Pen", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/the-camel-pen-phase221.md", storyTitle: "The Camel Pen：干墨颗粒、加水与修复风险", primarySourceKey: S.redeem.key, depthTier: "A",
  aliases: [{ alias: "Camel Pen", language: "en", sourceKey: S.redeem.key }, { alias: "Camel fountain pen", language: "en", sourceKey: S.penhero.key }, { alias: "Camel solid ink pen", language: "en", sourceKey: S.fountainPenIt.key }, { alias: "Camel 干墨钢笔", language: "zh", sourceKey: S.redeem.key }],
  sources: [S.redeem, S.penhero, S.fountainPenIt, S.patent, S.modelSvg], scopes: [{ key: modelScope, scopeKey: modelScope, productionState: "historical", materialScope: "赛璐珞／树脂样本、橡胶 sac、细金属内部支撑；具体装饰和笔尖按单支。", editionScope: "The Camel Pen；干墨颗粒腔和 button filler 退路不能套用到 Secretary、Newark 或其它 Camel 铅笔。" }],
  claims: [
    claim("camel-model-identity", "model_identity", "The Camel Pen 是 Camel Pen Company 在约 1935—1938 年的代表钢笔，身份依干墨颗粒机制、Camel 资料和样本刻字共同判断。", S.redeem.key, modelScope, "Camel product and dry pellet mechanism", [S.penhero.key, S.fountainPenIt.key]),
    claim("camel-filling", "filling_system", "尾部腔室放置干墨颗粒，加入水后形成墨水；部分样本可在颗粒缺失时退作 button filler，但必须先核验内部结构。", S.redeem.key, modelScope, "pellet chamber, water and button filler fallback", [S.patent.key]),
    claim("camel-history", "technology_history", "Camel 把便携固体墨概念和钢笔 sac 机构结合起来；专利、广告和修复记录分别证明机制、销售语境和样本状态。", S.penhero.key, modelScope, "1935-1938 history and advertising", [S.patent.key, S.redeem.key]),
    claim("camel-material", "material_boundary", "现存样本可见大理石纹赛璐珞／树脂、橡胶 sac 和细金属支撑；材料牌号与内部件完整度按实物核对。", S.redeem.key, modelScope, "brown marble sample and internal brace", [S.penhero.key]),
    claim("camel-nib", "nib_boundary", "Redeemed Pens 的单支样本使用 Camel 14K gold nib，并有湿润细线和 flex 体验；不把它推广为全批次统一尖材或弹性。", S.redeem.key, modelScope, "14K nib and single restored sample writing", [S.penhero.key]),
    claim("camel-restoration", "maintenance_guidance", "低间隙内件可能因干墨残留而粘连，拆解需让内部组件整体旋出；薄支撑断裂后才可评估 splint 或换 sac。", S.redeem.key, modelScope, "restoration and brace breakage", [S.penhero.key]),
    claim("camel-selection", "selection_guidance", "交易前看干墨腔、button、支撑片、赛璐珞裂纹、笔尖刻字和修复说明；颗粒来源不明时不能相信‘加水即写’保证。", S.redeem.key, modelScope, "condition checklist and dry pellet uncertainty", [S.penhero.key]),
  ],
  variants: [{ key: "camel-pellet", name: "干墨颗粒模式", notes: "历史商品概念；颗粒可得性和腔体状态按实物确认。", sourceKey: S.redeem.key, variantKind: "edition_group" }, { key: "camel-button", name: "Button filler 退路", notes: "部分样本可在颗粒缺失时恢复普通 sac 路线，不代表每支完整。", sourceKey: S.redeem.key, variantKind: "edition_group" }],
  spec: { brandEntityId: PHASE221_CAMEL_BRAND_ID, values: { series_name: "Camel Pen", release_year: "约 1935—1938 年；广告、专利与公司登记分开处理", origin_country: "美国新泽西语境；Camel Pen Company 与 Joseph Wustman 的关系有独立资料支持", nib: "Redeemed Pens 样本为 Camel 14K gold nib；尖幅和弹性按单支", fill_system: "干墨颗粒加水；部分样本可退作 button filler", material: "赛璐珞／树脂样本、橡胶 sac、细金属内部支撑", dimensions: "公开资料未形成统一尺寸表；按实物和版本记录", status: "历史小厂特殊机构；原装度与修复状态决定可用性" }, evidence: [specEvidence("brand_entity_id", S.penhero.key, "Camel company timeline"), specEvidence("series_name", S.redeem.key, "Camel Pen product identity"), specEvidence("release_year", S.penhero.key, "1935-1938 window"), specEvidence("origin_country", S.penhero.key, "New Jersey company record"), specEvidence("nib", S.redeem.key, "Camel 14K sample"), specEvidence("fill_system", S.redeem.key, "pellet and water; button fallback"), specEvidence("material", S.redeem.key, "brown marble and internal assembly"), specEvidence("dimensions", S.penhero.key, "no universal dimensions asserted"), specEvidence("status", S.redeem.key, "restoration-dependent historical sample") ] },
  media: [{ key: "camel-model-primary", title: S.modelSvg.title, sourceKey: S.modelSvg.key, localPath: S.modelSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；机制示意，非产品照片，不代表真实比例、颗粒形状、广告、模具或单支修复状态。", sourceUrl: S.modelSvg.url, usageStatus: "primary" }],
  timeline: [{ key: "camel-model-window", title: "Camel 干墨颗粒钢笔进入 1930 年代广告与实物记录", eventType: "model_released", startDate: "1936", circa: true, description: "PenHero 的广告时间线与 Redeemed Pens 的机制记录共同支持 1936 年前后的公开销售窗口；具体单支年份未知。", sourceKey: S.penhero.key }, { key: "camel-patent-window", title: "固体墨钢笔结构进入专利记录", eventType: "patent_filed", startDate: "1935", circa: true, description: "US2030452A 用于机制史证据；专利申请人、日期与商品品牌的完整对应仍保持谨慎。", sourceKey: S.patent.key }],
};

export const phase221CamelPacks: CuratedEntityPack[] = [brand, model];
