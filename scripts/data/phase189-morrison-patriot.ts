import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-25";
export const PHASE189_MORRISON_BRAND_ID = "tXa1mG6HXRJa";
export const PHASE189_PATRIOT_ID = "IKXbvQAJnW0p";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, independenceGroup: `${input.key}-group`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase189", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase189", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, summary: "本站原创 factual SVG；示意图，非产品照片，不证明比例、颜色、重量、徽章或库存。", allowedUse: "store_full", license: "site-original", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}

const S = {
  museum: live({ key: "phase189-morrison-museum", title: "Morse Museum：约 1920 年 Morrison 钢笔", url: "https://morsemuseum.org/collection-highlights/miscellaneous/other-art/morrison-pen/", registryName: "Charles Hosmer Morse Museum", sourceType: "official", tier: "primary", summary: "博物馆藏品页确认约 1920 年 Morrison 硬橡胶与金饰钢笔，作为品牌战前实物语境。", locator: "collection item: Morrison pen, c.1920, hard rubber and gold overlay" }),
  history: live({ key: "phase189-morrison-history", title: "FountainPen.it：美国小型制造商与 Morrison", url: "https://www.fountainpen.it/Produttori_minori_americani", registryName: "FountainPen.it", sourceType: "blog", tier: "contemporary_archive", summary: "历史索引将 Morrison Fountain Pen Company 的纽约起点放在 1910 年，并提醒其与其他商标的关系需要分层。", locator: "Morrison company history and New York origin" }),
  penhero: live({ key: "phase189-morrison-penhero", title: "PenHero：Roxy 与 Morrison 子品牌语境", url: "https://www.penhero.com/PenGallery/Morrison/Roxy1940s.htm", registryName: "PenHero", sourceType: "blog", tier: "professional_secondary", summary: "专业档案说明 Roxy 在 Morrison 纽约公司语境中出现；用于品牌边界，不把子品牌直接合并为 Patriot。", locator: "Roxy sub-brand and Morrison imprint context" }),
  forum: live({ key: "phase189-morrison-forum", title: "Fountain Pen Network：Morrison 钢笔史讨论", url: "https://www.fountainpennetwork.com/forum/topic/61492-morrison-pen/", registryName: "Fountain Pen Network participants", sourceType: "forum", tier: "professional_secondary", summary: "收藏者讨论纽约地址、M 夹标记和 Morton、Marathon 等名称的关系；仅作争议旁证。", locator: "New York company, clip mark and related-name discussion" }),
  patriotRepair: live({ key: "phase189-morrison-patriot-munson", title: "Munson Pens：Morrison Wartime Pens", url: "https://munsonpens.wordpress.com/2009/05/04/morrison-wartime-pens/", registryName: "Munson Pens / Fountain Pen Restoration", sourceType: "blog", tier: "professional_secondary", summary: "修复记录展示 Army Patriot、军绿色与帽顶徽章，并说明 syringe 填充器的密封维修难度。", locator: "Army Patriot, military color, crest and filler restoration" }),
  patriotRetail: live({ key: "phase189-morrison-patriot-peyton", title: "Peyton Street Pens：Morrison The Patriot", url: "https://www.peytonstreetpens.com/morrison-the-patriot-pen-olive-green-army-crest-syringe-filler-14k-extra-fine-nib-excellent-restored.html", registryName: "Peyton Street Pens", sourceType: "retailer", tier: "retailer", summary: "专业零售档案记录 1940 年代 Army 样本、约 5¼ 英寸、14K Morrison NY 尖和 Visual Vacuum/syringe 填充器。", locator: "1940s Army sample, 5-1/4 inch, 14K nib and syringe filler" }),
  patriotDoctor: live({ key: "phase189-morrison-patriot-doctor", title: "Vintage Pen Doctor：Morrison Patriot syringe filler", url: "https://vintagependoctor.com/simple-syringe-filling-under-barrel-the-morrison-patriot/", registryName: "Vintage Pen Doctor", sourceType: "blog", tier: "professional_secondary", summary: "修复资料解释 Patriot 的简单 syringe 填充逻辑，用于维护风险和专业维修边界。", locator: "syringe filling under barrel and restoration caution" }),
  patriotForum: live({ key: "phase189-morrison-patriot-forum", title: "Fountain Pen Network：Morrison Patriot 资料", url: "https://www.fountainpennetwork.com/forum/topic/228569-help-with-my-morrison/", registryName: "Fountain Pen Network participants", sourceType: "forum", tier: "contemporary_archive", summary: "玩家资料将 Patriot 与二战军种版本联系，并提醒 Morrison 品牌史存在不确定。", locator: "Patriot military variants and company-history boundary" }),
  brandSvg: diagram("phase189-morrison-brand-svg", "Morrison 品牌导航示意", "/images/library/site-original/phase189/morrison/brand.svg"),
  patriotSvg: diagram("phase189-morrison-patriot-svg", "Morrison Patriot 填充器示意", "/images/library/site-original/phase189/morrison/patriot.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.84, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const brandScope = "morrison-brand";
const patriotScope = "morrison-patriot-model";

const brand: CuratedEntityPack = {
  key: "phase189-morrison-brand",
  entityId: PHASE189_MORRISON_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "morrison",
  canonicalName: "Morrison",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/morrison-brand-phase189.md",
  storyTitle: "Morrison：纽约小型制造商与战时 Patriot 入口",
  primarySourceKey: S.museum.key,
  depthTier: "A",
  aliases: [{ alias: "Morrison Fountain Pen Company", language: "en", sourceKey: S.history.key }, { alias: "Morrison Pen Co.", language: "en", sourceKey: S.forum.key }, { alias: "Morrison", language: "en", sourceKey: S.museum.key }],
  sources: [S.museum, S.history, S.penhero, S.forum, S.patriotRepair, S.brandSvg],
  scopes: [{ key: brandScope, scopeKey: "morrison-brand-history-and-navigation", productionState: "unknown", editionScope: "纽约品牌历史、战前实物语境、Patriot 导航与相关商标边界" }],
  claims: [
    claim("morrison-brand-identity", "brand_identity", "Morrison 是在纽约钢笔资料中出现的历史品牌名称，资料从 1910 年前后的产品延伸到二战时期 Patriot。", S.history.key, brandScope, "New York company origin and chronology"),
    claim("morrison-brand-museum", "historical_context", "Morse Museum 收藏的约 1920 年硬橡胶金饰 Morrison 钢笔，提供战前实物语境。", S.museum.key, brandScope, "museum collection item and date"),
    claim("morrison-brand-boundary", "brand_boundary", "Marathon、Nassau、Morton、Roxy 等名称可作为关联检索，但公开讨论不足以证明它们与 Morrison 在所有年代共享同一生产关系。", S.penhero.key, brandScope, "sub-brand and related-name boundary"),
    claim("morrison-brand-navigation", "brand_model_navigation", "Patriot 是已来源化的战时代表型号；其 Visual Vacuum/syringe 填充器不回填到所有 Morrison 杠杆或金饰钢笔。", S.patriotRepair.key, brandScope, "Patriot-specific navigation boundary"),
    claim("morrison-brand-care", "maintenance_guidance", "历史 Morrison 钢笔的硬橡胶、镀层和密封件需要按具体藏品维护，不适合套用现代墨囊笔拆洗。", S.forum.key, brandScope, "historical-material maintenance boundary"),
  ],
  variants: [],
  timeline: [
    { key: "morrison-founded-1910", title: "纽约 Morrison 品牌出现于早期制造商资料", eventType: "brand_founded", startDate: "1910", circa: true, description: "历史索引将 Morrison Fountain Pen Company 的纽约起点放在 1910 年前后；具体公司档案仍需按来源核对。", sourceKey: S.history.key },
    { key: "morrison-museum-1920", title: "约 1920 年硬橡胶金饰藏品", eventType: "design_milestone", startDate: "1920", circa: true, description: "Morse Museum 收藏的一支约 1920 年硬橡胶金饰 Morrison 钢笔，提供战前实物语境。", sourceKey: S.museum.key },
    { key: "morrison-patriot-1940s", title: "战时 Patriot 进入军种主题语境", eventType: "design_milestone", startDate: "1940", circa: true, description: "Army 等军种主题 Patriot 的公开修复与零售样本集中在 1940 年代；不把每个徽章版本视为同一批次。", sourceKey: S.patriotRepair.key },
  ],
  media: [{ key: "morrison-brand-primary", title: S.brandSvg.title, sourceKey: S.brandSvg.key, localPath: S.brandSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表公司标志、比例或存世状态。", sourceUrl: S.brandSvg.url, usageStatus: "primary" }],
};

const pen: CuratedEntityPack = {
  key: "phase189-morrison-patriot",
  entityId: PHASE189_PATRIOT_ID,
  expectedType: "pen",
  expectedSlug: "morrison-s-patriot",
  canonicalName: "Morrison’s Patriot",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/morrison-patriot-phase189.md",
  storyTitle: "Morrison Patriot：军种徽章与 Visual Vacuum 上墨",
  primarySourceKey: S.patriotRepair.key,
  depthTier: "A",
  aliases: [{ alias: "Morrison Patriot", language: "en", sourceKey: S.patriotRepair.key }, { alias: "The Patriot", language: "en", sourceKey: S.patriotRetail.key }, { alias: "Morrison Visual Vacuum Filler", language: "en", sourceKey: S.patriotRetail.key }, { alias: "Morrison Patriot 军用笔", language: "zh", sourceKey: S.patriotForum.key }],
  sources: [S.patriotRepair, S.patriotRetail, S.patriotDoctor, S.patriotForum, S.history, S.patriotSvg],
  scopes: [{ key: patriotScope, scopeKey: "morrison-patriot-identity-filler-and-repair", productionState: "historical", editionScope: "1940 年代战时 Patriot、军种主题、Visual Vacuum/syringe 填充器、单支规格和维修边界" }],
  claims: [
    claim("morrison-patriot-identity", "model_identity", "Morrison Patriot 是 1940 年代纽约制造的战时型号，以军种主题帽顶、军用色外观和 Visual Vacuum/syringe 填充器为识别点。", S.patriotRepair.key, patriotScope, "Army Patriot wartime specimen"),
    claim("morrison-patriot-version", "version_boundary", "Army、Navy、Air Corps 等军种主题和徽章是版本线索，不能在徽章缺失或后配时仅凭外形确定具体版本。", S.patriotForum.key, patriotScope, "military-version discussion and evidence boundary"),
    claim("morrison-patriot-measurement", "sample_measurement", "专业零售样本约 5¼ 英寸合盖，并记录 14K Morrison NY 尖；数字和尖号属于单支样本。", S.patriotRetail.key, patriotScope, "single restored Army sample dimensions and nib"),
    claim("morrison-patriot-filler", "filling_system", "Visual Vacuum/syringe 填充器依靠细长储墨管、活塞或推杆和密封件形成吸入，不是 Parker Vacumatic 或 Pilot Custom 823 的同款。", S.patriotDoctor.key, patriotScope, "syringe filler mechanism and comparison boundary"),
    claim("morrison-patriot-care", "maintenance_guidance", "老化填充器可能吸水失败、漏气或管体开裂；先用清水测试，异常时交给熟悉历史填充器的修复者。", S.patriotRepair.key, patriotScope, "filler repair risk and conservative testing"),
  ],
  variants: [{ key: "morrison-patriot-army", name: "Army 主题样本", notes: "军绿色、Army 徽章与单支修复档案相互印证；不代表所有 Patriot。", sourceKey: S.patriotRetail.key, variantKind: "edition_group" }, { key: "morrison-patriot-navy-air", name: "Navy／Air Corps 等军种主题", notes: "公开玩家资料提及；徽章、颜色和原盒需由实物确认。", sourceKey: S.patriotForum.key, variantKind: "edition_group" }, { key: "morrison-patriot-14k", name: "14K Morrison NY 尖样本", notes: "专业零售样本记录；其他 Patriot 的尖号不自动继承。", sourceKey: S.patriotRetail.key, variantKind: "nib" }],
  spec: {
    brandEntityId: PHASE189_MORRISON_BRAND_ID,
    values: { series_name: "Morrison Patriot", origin_country: "美国纽约；专业零售档案将样本列为 1940 年代", nib: "具体样本可能为 14K Morrison NY；尖号、刻印和调校按实物确认", fill_system: "Visual Vacuum / syringe/post filler；密封、管体和推杆状态决定能否使用", material: "军绿色或深色笔身、金属饰件与帽顶军种徽章；颜色和徽章按版本", dimensions: "专业零售样本约 5¼ 英寸合盖；单支测量，不代表全系", weight: "公开资料未建立统一工厂重量；徽章、饰件和墨水会改变实物重量", status: "历史型号；1940 年代战时主题，存世状态和维修方案按单支核对" },
    evidence: [ev("morrison-patriot", "brand_entity_id", S.patriotRepair.key, patriotScope, "Morrison brand context"), ev("morrison-patriot", "series_name", S.patriotRepair.key, patriotScope, "Patriot identity"), ev("morrison-patriot", "origin_country", S.patriotRetail.key, patriotScope, "New York manufacturer and 1940s sample"), ev("morrison-patriot", "nib", S.patriotRetail.key, patriotScope, "14K Morrison NY sample nib"), ev("morrison-patriot", "fill_system", S.patriotDoctor.key, patriotScope, "syringe filler mechanism"), ev("morrison-patriot", "material", S.patriotRepair.key, patriotScope, "military color and crest"), ev("morrison-patriot", "dimensions", S.patriotRetail.key, patriotScope, "sample length"), ev("morrison-patriot", "weight", S.patriotRetail.key, patriotScope, "no unified factory weight"), ev("morrison-patriot", "status", S.patriotForum.key, patriotScope, "historical and retired boundary")],
  },
  media: [{ key: "morrison-patriot-primary", title: S.patriotSvg.title, sourceKey: S.patriotSvg.key, localPath: S.patriotSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表徽章、颜色、比例、重量或原厂配置。", sourceUrl: S.patriotSvg.url, usageStatus: "primary" }],
};

export const phase189MorrisonPatriotPacks: CuratedEntityPack[] = [brand, pen];
