import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";
import { phase22MontblancPacks } from "./phase22-montblanc";

export const PHASE46_MONTBLANC_BRAND_ID = "CJM8uLY0LmIX";
export const PHASE46_145_ID = "s46MB145CLASS";
export const PHASE46_STARWALKER_ID = "s46MBSTARWALK";
const RETRIEVED = "2026-07-19";

function live(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string; homepageUrl?: string }): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.homepageUrl ?? input.url,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary,
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const SOURCES = {
  mb145Official: live({ key: "phase46-mb145-official", title: "Montblanc Meisterstück Classique MB132466", url: "https://www.montblanc.com/en-us/meisterstuck-classique-fountain-pen-MB132466.html", registryKey: "montblanc-official", registryName: "Montblanc official", sourceType: "official", tier: "primary", summary: "官方当前 Classique MB132466／EF 页面列 precious resin、Au585/14K 镀铑尖、140×13.7 mm、21.73 g 与八种尖宽选择器。", locator: "Ident MB132466, material, nib, dimensions, weight and nib selector" }),
  mb145Care: live({ key: "phase46-mb145-care", title: "Montblanc Writing Instrument Care Services", url: "https://www.montblanc.com/en-co/customer-service-rna/care-services/writing-instruments.html", registryKey: "montblanc-care-current", registryName: "Montblanc current care guidance", sourceType: "official", tier: "contemporary_archive", summary: "官方服务页明确 Classique 可用墨囊或随附上墨器、约每三个月清洗，并给出永久墨水更短的清洗建议。", locator: "Classique filling, cleaning interval, nib service and authenticity guidance" }),
  mb146Compare: live({ key: "phase46-mb145-146", title: "Montblanc Meisterstück LeGrand MB132460", url: "https://www.montblanc.com/en-co/meisterstuck-gold-coated-legrand-fountain-pen-MB132460.html", registryKey: "montblanc-official", registryName: "Montblanc official", sourceType: "official", tier: "contemporary_archive", summary: "同代 LeGrand 官方页面用于对照 146 的 145.8×15.5 mm、25.42 g、14K 与内置活塞边界。", locator: "current LeGrand dimensions, weight, nib and piston comparison" }),
  mb149Compare: live({ key: "phase46-mb145-149", title: "Montblanc Meisterstück 149 MB132114", url: "https://www.montblanc.com/en-us/meisterstuck-gold-coated-149-fountain-pen-%28b%29-MB132114.html", registryKey: "montblanc-official", registryName: "Montblanc official", sourceType: "official", tier: "contemporary_archive", summary: "同代 149 官方页面用于对照最大体量、Au750/18K 与内置活塞边界。", locator: "current 149 dimensions, weight, nib and piston comparison" }),
  mb145Collector: live({ key: "phase46-mb145-collector", title: "fountainpen.de Meisterstück 145 Chopin", url: "https://www.fountainpen.de/c-145-en.htm", registryKey: "fountainpen-de", registryName: "fountainpen.de", sourceType: "blog", tier: "professional_secondary", summary: "收藏资料把 145 称作 Chopin，记录墨囊／converter、14K 尖、音乐 CD 包装与 1998 线索，但不是官方发布年。", locator: "145 Chopin naming, packaging, filling and chronology caveat" }),
  mb144Boundary: live({ key: "phase46-mb144-boundary", title: "fountainpen.de 144 Classique archive", url: "https://www.fountainpen.de/c-montblanc-meisterstueck-144-en.htm", registryKey: "fountainpen-de", registryName: "fountainpen.de", sourceType: "blog", tier: "professional_secondary", summary: "收藏系列索引将历史 144 Classique 与 145 Chopin、146 LeGrand、149 分列，支持不要把 Classique 直接回填 144。", locator: "144/145/146/149 family index and historical identity boundary" }),
  mb144Repair: live({ key: "phase46-mb144-repair", title: "PM Pens: Montblanc 144", url: "https://www.pm-pens.com/2021/06/28/montblanc-144/", registryKey: "pm-pens", registryName: "PM Pens", sourceType: "blog", tier: "professional_secondary", summary: "维修实物记录区分 144 的扣帽、较细体量与前代关系，并提醒旧笔尺寸与结构不应套用现行 145。", locator: "144 snap-cap and relative size comparison to 145" }),
  mb145Compare: live({ key: "phase46-mb145-compare", title: "Pen Boutique Meisterstück size comparison", url: "https://www.penboutique.com/blogs/blog/why-are-montblancs-so-special-lets-begin-with-meisterstuck", registryKey: "pen-boutique", registryName: "Pen Boutique", sourceType: "retailer", tier: "retailer", summary: "可靠零售商对照表提供 145／144／146／149 的样本尺寸、帽结构与供墨差异，作为二级实测而非全年代定律。", locator: "145/144/146/149 capped size, weight, cap and filling comparison" }),
  mb145Use: live({ key: "phase46-mb145-use", title: "Always Sunny Always Real Classique review", url: "https://alwayssunnyalwaysreal.wordpress.com/2016/03/12/pen-review-montblanc-meisterstuck-classique-platinum-line/", registryKey: "always-sunny-real", registryName: "Always Sunny Always Real", sourceType: "blog", tier: "professional_secondary", summary: "单支 Classique 铂金饰件样本补充旋盖、墨囊／converter 与握持平衡，明确属于个人使用观察。", locator: "single-sample cap, filling and balance observations" }),
  mb145Authenticity: live({ key: "phase46-mb145-auth", title: "fountainpen.de Montblanc counterfeit guide", url: "https://www.fountainpen.de/news/Newsletter1-fakes.pdf", registryKey: "fountainpen-de", registryName: "fountainpen.de", sourceType: "blog", tier: "contemporary_archive", summary: "旧赝品指南支持包装、证件、序列号不能单点验真，不能把历史样本特征当作今日所有版本规则。", locator: "counterfeit warning and multi-point authenticity caveat" }),
  mb145Svg: diagram("phase46-mb145-svg", "Montblanc Meisterstück 145／Classique 事实卡", "/images/library/site-original/montblanc-145-starwalker/mb145.svg", "本站原创事实图，区分现行 Classique MB132466、墨囊／converter、旋盖与 144/146/149边界；示意图，非产品照片。"),
  starCollection: live({ key: "phase46-star-collection", title: "Montblanc StarWalker current collection", url: "https://www.montblanc.com/en-us/writing-instruments/collection/starwalker?page=1", registryKey: "montblanc-official", registryName: "Montblanc official", sourceType: "official", tier: "primary", summary: "官方 collection 同时列 StarWalker fountain pen、fineliner、ballpoint 及 Precious Resin、Doué、Metal、Extreme 等家族变体。", locator: "current collection writing modes and material variants" }),
  starStandard: live({ key: "phase46-star-standard", title: "Montblanc StarWalker Precious Resin MB132532", url: "https://www.montblanc.com/en-co/starwalker-precious-resin-fountain-pen-piston-converter-MB132532.html", registryKey: "montblanc-official", registryName: "Montblanc official", sourceType: "official", tier: "primary", summary: "标准黑色 Precious Resin MB132532／F 页面列 135.7×14.9 mm、33.41 g、14K 镀铑尖与 piston converter。", locator: "MB132532 material, nib, dimensions, weight and piston converter" }),
  starDoue: live({ key: "phase46-star-doue", title: "Montblanc StarWalker Doué MB132534", url: "https://www.montblanc.com/en-us/starwalker-doue-fountain-pen-piston-converter-%28f%29-MB132534.html", registryKey: "montblanc-official", registryName: "Montblanc official", sourceType: "official", tier: "contemporary_archive", summary: "标准 Doué MB132534／F 给出同名尺寸但不同的金属帽与 42.88 g 重量，不回填树脂款。", locator: "MB132534 Doué trim and weight boundary" }),
  starExtremeResin: live({ key: "phase46-star-extreme-resin", title: "Montblanc StarWalker Extreme Precious Resin MB133762", url: "https://www.montblanc.com/en-us/starwalker-extreme-precious-resin-fountain-pen-MB133762.html", registryKey: "montblanc-official", registryName: "Montblanc official", sourceType: "official", tier: "contemporary_archive", summary: "Extreme Precious Resin MB133762／M 官方页面给出约 28.3 g 与橙色穹罩主题。", locator: "MB133762 Extreme resin weight, nib and orange dome" }),
  starExtremeDoue: live({ key: "phase46-star-extreme-doue", title: "Montblanc StarWalker Extreme Doué MB133766", url: "https://www.montblanc.com/en-us/starwalker-extreme-doue-fountain-pen-MB133766.html", registryKey: "montblanc-official", registryName: "Montblanc official", sourceType: "official", tier: "contemporary_archive", summary: "Extreme Doué MB133766／M 官方页面给出约 37.25 g 与镀钌金属帽边界。", locator: "MB133766 Extreme Doué weight and material" }),
  starExtremeMetal: live({ key: "phase46-star-extreme-metal", title: "Montblanc StarWalker Extreme Metal MB133770", url: "https://www.montblanc.com/en-us/starwalker-extreme-metal-fountain-pen-MB133770.html", registryKey: "montblanc-official", registryName: "Montblanc official", sourceType: "official", tier: "contemporary_archive", summary: "Extreme Metal MB133770／M 官方页面给出约 47.3 g，说明全金属版本不能与树脂款共用重量。", locator: "MB133770 Extreme Metal weight and material" }),
  star2003: live({ key: "phase46-star-2003", title: "Richemont Annual Report 2004: StarWalker launch", url: "https://www.richemont.com/media/q0gpdpyc/annual-report-2004.pdf", registryKey: "richemont-reports", registryName: "Richemont annual reports", sourceType: "official", tier: "contemporary_archive", summary: "Richemont 2004 年报确认 StarWalker 书写工具系列于 2003 年推出，并配原始设计图注。", locator: "PDF p.21, 2003 launch and original StarWalker design caption" }),
  star2019: live({ key: "phase46-star-2019", title: "Richemont FY2020 Business Review: newly designed StarWalker", url: "https://www.richemont.com/media/smnew23u/ar_fy2020_business_review_d83jnf67asb34a.pdf", registryKey: "richemont-reports", registryName: "Richemont annual reports", sourceType: "official", tier: "contemporary_archive", summary: "Richemont FY2020 报告把 2019 描述为 newly designed StarWalker 的重新推出，支持 2003 首发／2019 重设计。", locator: "PDF p.20, 2019 newly designed StarWalker relaunch" }),
  starReview: live({ key: "phase46-star-review", title: "Pen Boutique StarWalker Space Blue review", url: "https://www.penboutique.com/blogs/blog/montblanc-starwalker-space-blue-tactile-taste", registryKey: "pen-boutique", registryName: "Pen Boutique", sourceType: "retailer", tier: "retailer", summary: "实物评测补充树脂、Doué、金属的重量层级与尾端螺纹体验，不能替代每个 SKU 官方规格。", locator: "Space Blue material, weight and cap-thread observations" }),
  starProfessional: live({ key: "phase46-star-professional", title: "Fountain Pen Network StarWalker user record", url: "https://www.fountainpennetwork.com/forum/topic/16782-mont-blanc-starwalker/", registryKey: "fountain-pen-network", registryName: "Fountain Pen Network", sourceType: "blog", tier: "professional_secondary", summary: "专业钢笔社区的早期 StarWalker 使用记录补充旧代仅墨囊与上墨器兼容性边界，不能覆盖当前 SKU。", locator: "older StarWalker filling and converter compatibility discussion" }),
  starVintage: live({ key: "phase46-star-vintage", title: "Peyton Street Pens older StarWalker resin sample", url: "https://www.peytonstreetpens.com/montblanc-starwalker-fountain-pen-black-precious-resin-pt-trim-fine-14k-nib-excellent-in-box-works-well.html", registryKey: "peyton-street-pens", registryName: "Peyton Street Pens", sourceType: "retailer", tier: "retailer", summary: "旧黑色树脂 StarWalker 实物样本记录了仅墨囊、旧代上墨器兼容性与 14K F 尖，不能回填当前 MB132532。", locator: "older resin sample filling and converter compatibility boundary" }),
  starSvg: diagram("phase46-star-svg", "Montblanc StarWalker family 事实卡", "/images/library/site-original/montblanc-145-starwalker/starwalker.svg", "本站原创事实图，区分 2003 首发、2019 重设计、Precious Resin/Doué/Metal/Extreme 与可拆卸 converter；示意图，非产品照片。"),
};

function specEvidence(fieldKey: "brand_entity_id" | "series_name" | "release_year" | "origin_country" | "nib" | "fill_system" | "material" | "dimensions" | "status", key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function makePack(input: { key: string; id: string; slug: string; name: string; title: string; summary: string; markdownFile: string; primary: CuratedSource; secondary: CuratedSource; extra: CuratedSource[]; svg: CuratedSource; aliases: string[]; release: string; nib: string; fill: string; material: string; dimensions: string; status: string; boundary: string; variants: Array<{ key: string; name: string; notes: string; sourceKey: string; releaseYear?: string; productCode?: string }> }): CuratedEntityPack {
  const scopeKey = `${input.key}-scope`;
  const sources = [input.primary, input.secondary, ...input.extra, input.svg].filter((source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index);
  return {
    key: `phase46-${input.key}-v1`, entityId: input.id, expectedType: "pen", expectedSlug: input.slug, canonicalName: input.name,
    publicationIntent: "publish", publicationBlockers: [], markdownFile: input.markdownFile, storyTitle: input.title, primarySourceKey: input.primary.key, depthTier: "A",
    aliases: input.aliases.map((alias, index) => ({ alias, language: alias.match(/[\u4e00-\u9fff]/) ? "zh" : "en", sourceKey: index === 0 ? input.primary.key : input.secondary.key })),
    sources, scopes: [{ key: scopeKey, scopeKey, productionState: input.status.includes("历史") ? "historical" : "current", editionScope: "具体型号或 family；材质、主题、市场与历史代际按 variant 记录" }],
    claims: [
      { key: `${input.key}-identity`, predicate: "model_identity", objectText: input.summary, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: "official model identity", evidence: [{ key: `${input.key}-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: "official model identity and product specifications" }] },
      { key: `${input.key}-boundary`, predicate: "version_boundary", objectText: input.boundary, factClass: "core", confidence: 0.99, sourceKey: input.secondary.key, locator: "professional boundary", evidence: [{ key: `${input.key}-boundary-evidence`, sourceKey: input.secondary.key, scopeKey, locator: "professional secondary boundary" }, { key: `${input.key}-official-boundary`, sourceKey: input.primary.key, scopeKey, locator: "official product-specific boundary" }] },
    ],
    variants: input.variants.map((variant) => ({ ...variant, variantKind: "market_sku" as const })),
    spec: {
      brandEntityId: PHASE46_MONTBLANC_BRAND_ID,
      values: { series_name: input.name, release_year: input.release, origin_country: "官方 Montblanc 产品线；汉堡生产与具体版本按来源核对", nib: input.nib, fill_system: input.fill, material: input.material, dimensions: input.dimensions, status: input.status },
      evidence: [specEvidence("brand_entity_id", `${input.key}-brand`, input.primary.key, scopeKey, "Montblanc maker identity"), specEvidence("series_name", `${input.key}-series`, input.primary.key, scopeKey, "official product or family title"), specEvidence("release_year", `${input.key}-release`, input.primary.key, scopeKey, "official chronology or explicit uncertainty"), specEvidence("origin_country", `${input.key}-origin`, input.primary.key, scopeKey, "official brand context; no factory inference"), specEvidence("nib", `${input.key}-nib`, input.primary.key, scopeKey, "official nib field"), specEvidence("fill_system", `${input.key}-fill`, input.primary.key, scopeKey, "official filling system"), specEvidence("material", `${input.key}-material`, input.primary.key, scopeKey, "official material field"), specEvidence("dimensions", `${input.key}-dimensions`, input.primary.key, scopeKey, "official dimensions/weight"), specEvidence("status", `${input.key}-status`, input.secondary.key, scopeKey, "current/market and sibling boundary")],
    },
    media: [{ key: `${input.key}-primary`, title: `${input.name} 事实卡（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影，不表现真实比例、颜色、Logo 或刻字。", sourceUrl: input.svg.url, usageStatus: "primary" }],
    timeline: [{ key: `${input.key}-timeline`, title: `${input.name} 进入产品体系`, eventType: "model_released", startDate: input.release.match(/\d{4}/)?.[0] ?? "2003", circa: true, description: input.summary, sourceKey: input.primary.key }],
  };
}

const montblancBrand = structuredClone(phase22MontblancPacks.find((pack) => pack.entityId === PHASE46_MONTBLANC_BRAND_ID && pack.expectedType === "brand"));
if (!montblancBrand) throw new Error("Phase 46 Montblanc brand pack missing.");
montblancBrand.key = "phase46-montblanc-brand-v1";

export const phase46Montblanc145StarWalkerPacks: CuratedEntityPack[] = [
  montblancBrand,
  makePack({ key: "montblanc-145", id: PHASE46_145_ID, slug: "montblanc-145-classique", name: "万宝龙 Montblanc Meisterstück 145／Classique", title: "万宝龙 145／Classique：旋盖墨囊钢笔的型号边界", summary: "现行 Meisterstück Classique 常以 145 指代，MB132466／EF 规格锚点为 14K 镀铑尖、140×13.7 mm、21.73 g，并使用墨囊或可拆卸上墨器而非内置活塞。", markdownFile: ".planning/content-research/montblanc-145-publishable-content-2026-07-19.md", primary: SOURCES.mb145Official, secondary: SOURCES.mb145Collector, extra: [SOURCES.mb145Care, SOURCES.mb146Compare, SOURCES.mb149Compare, SOURCES.mb144Boundary, SOURCES.mb144Repair, SOURCES.mb145Compare, SOURCES.mb145Use, SOURCES.mb145Authenticity], svg: SOURCES.mb145Svg, aliases: ["Montblanc 145", "Meisterstück 145", "Montblanc Classique", "Meisterstück Classique", "万宝龙 145", "大班 145", "Chopin", "Hommage à Frédéric Chopin", "P145"], release: "未设确定年份（收藏资料称自 1998）", nib: "Au585／14K 金，镀铑；EF/F/M/B/BB/OM/OB/OBB", fill: "墨囊或随附可拆卸 converter；不是内置活塞", material: "黑色 precious resin；镀铂金饰件（MB132466）", dimensions: "MB132466／EF 官方 140×13.7 mm、21.73 g；轴名未清楚标注，其他笔尖和历史版本另核", status: "现行 Classique 规格锚点；Chopin／P145 为历史或收藏别名，144 为独立前代", boundary: "145／Classique 是旋入式笔帽的墨囊／converter 型号；历史 144 主要以扣帽和更细体量区分，146 LeGrand 与 149 则是内置活塞家族，不能把 Classique 泛称直接回填 144 或 146。", variants: [{ key: "mb145-mb132466", name: "Meisterstück Classique MB132466／EF", releaseYear: "现行", productCode: "MB132466", notes: "黑色 precious resin、镀铂金饰件、Au585／14K 镀铑 EF 尖，官方约 140×13.7 mm、21.73 g。", sourceKey: SOURCES.mb145Official.key }, { key: "mb145-chopin", name: "145 Chopin／Hommage à Frédéric Chopin", releaseYear: "收藏资料称自 1998，未由官方复核", notes: "市场与礼盒别名，曾见音乐 CD 包装；不当作独立现行限量身份。", sourceKey: SOURCES.mb145Collector.key }, { key: "mb145-p145", name: "P145 铂金饰件写法", notes: "收藏资料中的饰件简称，不能替代现行 Ident No.。", sourceKey: SOURCES.mb145Collector.key }] }),
  makePack({ key: "montblanc-starwalker", id: PHASE46_STARWALKER_ID, slug: "montblanc-starwalker", name: "万宝龙 Montblanc StarWalker", title: "Montblanc StarWalker：2003 首发、2019 重设计的现代家族", summary: "StarWalker 是 2003 年推出、2019 年重新设计的现代书写工具家族；现行钢笔按 Precious Resin、Doué、Metal、Extreme 与主题配色分 variants，使用墨囊或可拆卸上墨器。", markdownFile: ".planning/content-research/montblanc-starwalker-publishable-content-2026-07-19.md", primary: SOURCES.starStandard, secondary: SOURCES.starProfessional, extra: [SOURCES.starCollection, SOURCES.starDoue, SOURCES.starExtremeResin, SOURCES.starExtremeDoue, SOURCES.starExtremeMetal, SOURCES.star2003, SOURCES.star2019, SOURCES.mb145Care, SOURCES.starReview, SOURCES.starVintage], svg: SOURCES.starSvg, aliases: ["Montblanc StarWalker", "Montblanc Starwalker", "StarWalker", "Starwalker", "万宝龙 StarWalker"], release: "2003 首发；2019 重设计／relaunch", nib: "标准 MB132532／F 为 Au585／14K 镀铑；家族各 SKU 另有 F/M 等选择", fill: "墨囊或随附可拆卸 piston converter；不是内置活塞", material: "Precious Resin、Doué、Metal、Extreme 与主题配色按 variant 分立", dimensions: "标准 MB132532／F 官方 135.7×14.9 mm、33.41 g；Doué/Extreme/Metal 约同名尺寸但重量按 SKU 分立", status: "现行 family；2026-07-19 官方 collection 仍列 fountain pen、fineliner、ballpoint 多种模式", boundary: "StarWalker 是 family-level canonical，不把钢笔、fineliner、圆珠笔混成同一商品；Precious Resin、Doué、Metal、Extreme 与 Blue Planet/PolarGreen/SpaceBlue 是 variants。商品名中的 piston converter 是可拆卸上墨器，不等于 146/149 的内置活塞；旧代仅墨囊样本不能回填当前兼容性。", variants: [{ key: "starwalker-mb132532", name: "StarWalker Precious Resin MB132532／F", releaseYear: "现行", productCode: "MB132532", notes: "黑色树脂帽杆、镀铂金饰件、Au585／14K 镀铑尖，约 135.7×14.9 mm、33.41 g。", sourceKey: SOURCES.starStandard.key }, { key: "starwalker-mb132534", name: "StarWalker Doué MB132534／F", releaseYear: "现行 SKU", productCode: "MB132534", notes: "金属帽配树脂杆，官方约 42.88 g，不能回填树脂款。", sourceKey: SOURCES.starDoue.key }, { key: "starwalker-mb133762", name: "StarWalker Extreme Precious Resin MB133762／M", releaseYear: "现行 SKU", productCode: "MB133762", notes: "Extreme 树脂版本约 28.3 g，橙色穹罩主题。", sourceKey: SOURCES.starExtremeResin.key }, { key: "starwalker-mb133766", name: "StarWalker Extreme Doué MB133766／M", releaseYear: "现行 SKU", productCode: "MB133766", notes: "Extreme Doué 约 37.25 g，镀钌金属帽。", sourceKey: SOURCES.starExtremeDoue.key }, { key: "starwalker-mb133770", name: "StarWalker Extreme Metal MB133770／M", releaseYear: "现行 SKU", productCode: "MB133770", notes: "Extreme Metal 约 47.3 g，全金属负担明显不同。", sourceKey: SOURCES.starExtremeMetal.key }, { key: "starwalker-2019-design", name: "2019 重设计主题与特别色", releaseYear: "2019–", notes: "Blue Planet、PolarGreen、SpaceBlue 等主题按具体 Ident、材质与穹罩颜色核对，不共用标准款重量。", sourceKey: SOURCES.star2019.key }] }),
];
