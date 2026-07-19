import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase41IdentityCleanupPacks } from "./phase41-identity-cleanup";

export const PHASE50_WATERMAN_BRAND_ID = "zkAu9PePDdqJ";
export const PHASE50_CARENE_ID = "qsuRSNYKpI6-";
export const PHASE50_EXPERT_ID = "YAiCRah1XAsz";

const RETRIEVED = "2026-07-19";

function live(input: { key: string; title: string; url: string; registry: string; name: string; type: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return {
    key: input.key,
    registryKey: `phase50-${input.registry}-${input.key}`,
    registryName: input.name,
    sourceType: input.type,
    tier: input.tier,
    independenceGroup: `phase50-${input.registry}`,
    title: input.title,
    url: input.url,
    homepageUrl: input.url,
    author: input.name,
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
  history: live({ key: "phase50-waterman-history", title: "Waterman official heritage timeline", url: "https://www.waterman.com/waterman-history.html", registry: "official-history", name: "Waterman official heritage", type: "official", tier: "primary", summary: "官方历史页将 Expert 放在 1990–92，将 Carène 放在 1997，并说明两者在现代 Waterman 产品史中的位置。", locator: "1990-92 Expert and 1997 Carène timeline entries" }),
  catalogue: live({ key: "phase50-waterman-catalogue-2021", title: "Waterman 2021 Trade Catalogue", url: "https://assets.waterman.com/is/content/NewellRubbermaid/wtrmn_trdctlg_2021", registry: "official-catalogue", name: "Waterman official catalogue", type: "official", tier: "contemporary_archive", summary: "官方目录把 Carène 与 Expert 分列为不同 collection，列出 Carène 包覆式尖、Expert 金尖/钢尖和墨囊／converter 语境。", locator: "Carène and Expert collection pages" }),
  careneOfficial: live({ key: "phase50-carene-official", title: "Waterman Carène collection", url: "https://www.waterman.com/carene-pens.html", registry: "carene-official", name: "Waterman official", type: "official", tier: "primary", summary: "官方 Carène collection 说明 integrated nib、海洋线条、Finish 变体以及七种字幅选择。", locator: "Carène unique nib, finishes and fountain-pen nib sizes" }),
  carene2014: live({ key: "phase50-carene-2014-catalogue", title: "Waterman 2014 catalogue Carène specifications", url: "https://www.watermanromania.ro/cataloage1/Waterman/Waterman-2014Brochure.pdf", registry: "carene-catalogue", name: "Waterman catalogue archive", type: "official", tier: "contemporary_archive", summary: "历史目录记录 Carène 18K solid gold nib、EF/F/M/B/Stub/OF/OB、漆面和镀金/钯饰件，作为代际与材质交叉证据。", locator: "Carène fountain pen strengths, nib and finish table" }),
  careneProfessional: live({ key: "phase50-carene-professional", title: "Andrew Lensky modern Waterman Carène", url: "https://lenskiy.org/2026/01/modern-waterman-carene/", registry: "carene-lensky", name: "Andrew Lensky", type: "blog", tier: "professional_secondary", summary: "专业实物记录补充 Carène 的嵌入式 18K 尖、尺寸和握持限制；个人样本不泛化为每一代。", locator: "Carène 18K nib, dimensions and user observations" }),
  careneTenpen: live({ key: "phase50-carene-tenpen", title: "Tenpen Waterman Carène history", url: "https://www.tenpen.it/node/1695", registry: "carene-tenpen", name: "Tenpen", type: "blog", tier: "professional_secondary", summary: "钢笔专业文章将 Carène 放在 1997–98、海洋设计和 Edson 之后的旗舰语境，并区分设计致敬与型号身份。", locator: "Carène launch period, nautical design and family context" }),
  careneSvg: diagram("phase50-carene-svg", "Waterman Carène 事实卡", "/images/library/site-original/waterman-carene-expert/waterman-carene.svg", "本站原创事实图，区分 1997、包覆式 18K 尖、漆面与墨囊／converter；示意图，非产品照片。"),
  expertOfficial: live({ key: "phase50-expert-official", title: "Waterman Expert collection", url: "https://www.waterman.com/expert-pens.html", registry: "expert-official", name: "Waterman official", type: "official", tier: "primary", summary: "官方 Expert collection 将其定位为体量较饱满的商务书写路线，并列出现行钢笔商品。", locator: "Expert collection and fountain-pen entry" }),
  expertSbre: live({ key: "phase50-expert-sbrebrown", title: "SBREBrown Waterman Expert III review", url: "https://www.sbrebrown.com/2018/01/waterman-expert-iii-fountain-pen-review/", registry: "expert-sbrebrown", name: "SBREBrown", type: "blog", tier: "professional_secondary", summary: "专业评测记录 Expert III 的钢尖、墨囊／converter、旋盖、体量和书写感受，明确是单支现行样本。", locator: "Expert III nib, filling, cap and writing observations" }),
  expertBadger: live({ key: "phase50-expert-badger", title: "Badger & Blade Waterman Expert review", url: "https://www.badgerandblade.com/forum/threads/pen-review-waterman-expert.443182/", registry: "expert-badger", name: "Badger & Blade", type: "forum", tier: "professional_secondary", summary: "用户实测提供 Expert 钢尖、约 141 mm 与 C/C 兼容的样本参数，用于使用体验与尺寸范围，不替代官方 SKU。", locator: "Expert steel nib, cartridge/converter and sample dimensions" }),
  expertFpnGen1: live({ key: "phase50-expert-fpn-generations", title: "Fountain Pen Network first-generation Expert", url: "https://www.fountainpennetwork.com/forum/topic/97392-waterman-1st-generation-expert/", registry: "expert-fpn-generations", name: "Fountain Pen Network", type: "forum", tier: "professional_secondary", summary: "收藏资料把约 1995 的第一代 Expert 与约 2000 后的第二代区分开：塑料轻体、三维钢尖、夹帽结构和后续漆面黄铜重体不能混写。", locator: "first-generation Expert circa 1995 and second-generation boundary" }),
  expertCatalogue: live({ key: "phase50-expert-catalogue", title: "Waterman 2021 catalogue Expert 18K gold nib", url: "https://assets.waterman.com/is/content/NewellRubbermaid/wtrmn_trdctlg_2021", registry: "expert-catalogue", name: "Waterman official catalogue", type: "official", tier: "contemporary_archive", summary: "同一官方目录保留 Expert 的 18K gold nib 条目，说明 Expert 家族不能简单写成一律钢尖。", locator: "Expert 18K gold nib product row" }),
  expertSvg: diagram("phase50-expert-svg", "Waterman Expert 事实卡", "/images/library/site-original/waterman-carene-expert/waterman-expert.svg", "本站原创事实图，区分 1990–92 商务定位、Expert I/II/III 代际、钢尖/18K 选项与 C/C；示意图，非产品照片。"),
};

function specEvidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function makePen(input: { key: string; id: string; slug: string; name: string; title: string; summary: string; markdownFile: string; primary: CuratedSource; secondary: CuratedSource; extra: CuratedSource[]; svg: CuratedSource; aliases: string[]; release: string; nib: string; fill: string; material: string; dimensions: string; status: string; boundary: string; variants: Array<{ key: string; name: string; releaseYear?: string; productCode?: string; notes: string; sourceKey: string }> }): CuratedEntityPack {
  const scopeKey = `${input.key}-scope`;
  const sources = [input.primary, input.secondary, ...input.extra, input.svg].filter((source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index);
  return {
    key: `phase50-${input.key}-v1`, entityId: input.id, expectedType: "pen", expectedSlug: input.slug, canonicalName: input.name,
    publicationIntent: "publish", publicationBlockers: [], markdownFile: input.markdownFile, storyTitle: input.title, primarySourceKey: input.primary.key, depthTier: "A",
    aliases: input.aliases.map((alias, index) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: index === 0 ? input.primary.key : input.secondary.key })),
    sources, scopes: [{ key: scopeKey, scopeKey, productionState: input.status.includes("历史") ? "historical" : "current", editionScope: "Waterman 具体系列；材料、尖材与代际按 variant 记录" }],
    claims: [
      { key: `${input.key}-identity`, predicate: "model_identity", objectText: input.summary, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: "official model identity", evidence: [{ key: `${input.key}-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: "official product or catalogue identity" }] },
      { key: `${input.key}-boundary`, predicate: "version_boundary", objectText: input.boundary, factClass: "core", confidence: 0.98, sourceKey: input.secondary.key, locator: "professional and catalogue boundary", evidence: [{ key: `${input.key}-boundary-evidence`, sourceKey: input.secondary.key, scopeKey, locator: "professional generation or family boundary" }, { key: `${input.key}-official-boundary`, sourceKey: input.primary.key, scopeKey, locator: "official product-specific boundary" }] },
      { key: `${input.key}-care`, predicate: "maintenance_boundary", objectText: "Waterman 墨囊／converter 钢笔按品牌说明用清水吸排，排空后自然干燥；不使用热水、酒精或溶剂，不把金属抛光剂带到尖座、漆面和密封件。", factClass: "core", confidence: 0.96, sourceKey: input.primary.key, locator: "Waterman care and filling guidance", evidence: [{ key: `${input.key}-care-evidence`, sourceKey: input.primary.key, scopeKey, locator: "official collection and Waterman maintenance practice" }] },
    ],
    variants: input.variants.map((variant) => ({ ...variant, variantKind: "market_sku" as const })),
    spec: {
      brandEntityId: PHASE50_WATERMAN_BRAND_ID,
      values: { series_name: input.name, release_year: input.release, origin_country: "Waterman Paris 产品线；法国制造与具体批次按目录和包装核对", nib: input.nib, fill_system: input.fill, material: input.material, dimensions: input.dimensions, status: input.status },
      evidence: [specEvidence("brand_entity_id", `${input.key}-brand`, input.primary.key, scopeKey, "Waterman maker identity"), specEvidence("series_name", `${input.key}-series`, input.primary.key, scopeKey, "official product title"), specEvidence("release_year", `${input.key}-release`, SOURCES.history.key, scopeKey, "official heritage timeline"), specEvidence("origin_country", `${input.key}-origin`, SOURCES.history.key, scopeKey, "official Waterman context; no factory inference"), specEvidence("nib", `${input.key}-nib`, input.primary.key, scopeKey, "official nib field or catalogue"), specEvidence("fill_system", `${input.key}-fill`, input.primary.key, scopeKey, "official/archival filling system"), specEvidence("material", `${input.key}-material`, input.primary.key, scopeKey, "official material field"), specEvidence("dimensions", `${input.key}-dimensions`, input.secondary.key, scopeKey, "professional sample measurement"), specEvidence("status", `${input.key}-status`, input.secondary.key, scopeKey, "current/market and generation boundary")],
    },
    media: [{ key: `${input.key}-primary`, title: `${input.name} 事实卡（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影，不表现真实比例、颜色、Logo 或刻字。", sourceUrl: input.svg.url, usageStatus: "primary" }],
    timeline: [{ key: `${input.key}-timeline`, title: `${input.name} 进入 Waterman 产品体系`, eventType: "model_released", startDate: input.release.match(/\d{4}/)?.[0] ?? "1990", circa: true, description: input.summary, sourceKey: SOURCES.history.key }],
  };
}

const watermanBrand = structuredClone(phase41IdentityCleanupPacks.find((pack) => pack.entityId === PHASE50_WATERMAN_BRAND_ID && pack.expectedType === "brand"));
if (!watermanBrand) throw new Error("Phase 50 Waterman brand pack missing.");
watermanBrand.key = "phase50-waterman-brand-v1";

export const phase50WatermanCareneExpertPacks: CuratedEntityPack[] = [
  watermanBrand,
  makePen({ key: "carene", id: PHASE50_CARENE_ID, slug: "waterman-carene", name: "威迪文 Waterman Carène", title: "Waterman Carène：1997 起的海洋线条与包覆式金尖", summary: "Waterman Carène 是 1997 年推出的旗舰系列，以游艇／船体线条和包覆式 18K 金尖形成辨识度；当前与历史漆面、饰件和字幅按 SKU 区分。", markdownFile: ".planning/content-research/waterman-carene.md", primary: SOURCES.careneOfficial, secondary: SOURCES.careneProfessional, extra: [SOURCES.history, SOURCES.catalogue, SOURCES.carene2014, SOURCES.careneTenpen], svg: SOURCES.careneSvg, aliases: ["Waterman Carène", "Waterman Carene", "威迪文 Carène", "威迪文 海韵", "Waterman Carene Deluxe"], release: "1997", nib: "常见 18K／750 solid gold integrated/inset nib；EF、F、M、B、Stub、OF、OB 等按代际与 SKU", fill: "Waterman cartridge/converter", material: "漆面笔身与金属饰件；GT 金色、ST 钯色及 Deluxe／主题颜色按 variant", dimensions: "不同饰件与代际有差异；专业样本约合帽 14.3 cm、无帽约 12.8 cm，不能当全系列统一值", status: "现行 collection 与历史颜色并存；具体库存按市场和商品号核对", boundary: "Carène 是 Waterman 独立的海洋设计系列，不能与 Hémisphère 的细长不锈钢尖、Expert 的商务厚体或 Edson 直接合并；‘integrated/inset nib’是笔尖嵌入握位的结构描述，不等于整支笔无可维护尖座。", variants: [{ key: "carene-standard", name: "Carène Black Sea／Blue／Marine finishes", releaseYear: "现行与历史多代", notes: "标准漆面、GT 或 ST 饰件；颜色与金属电镀按商品号和盒卡核对。", sourceKey: SOURCES.careneOfficial.key }, { key: "carene-deluxe", name: "Carène Deluxe", releaseYear: "现行／地区 SKU", notes: "更复杂的漆面或饰件组合，不能用标准款重量、颜色和售价回填。", sourceKey: SOURCES.careneOfficial.key }, { key: "carene-early", name: "1997–2000s early Carène", releaseYear: "1997–约 2000s", notes: "早期 18K 尖刻字与 Coral、Marine 等旧色属于历史变体；二手购买需核对尖面、笔夹和饰件。", sourceKey: SOURCES.carene2014.key }] }),
  makePen({ key: "expert", id: PHASE50_EXPERT_ID, slug: "waterman-expert", name: "威迪文 Waterman Expert", title: "Waterman Expert：1990–92 起的商务体量与三代边界", summary: "Waterman Expert 是 1990–92 年进入产品史的饱满商务钢笔系列；第一代轻质塑料与三维钢尖、后续漆面黄铜重体及现行 Expert III 必须按代际分开。", markdownFile: ".planning/content-research/waterman-expert.md", primary: SOURCES.expertOfficial, secondary: SOURCES.expertFpnGen1, extra: [SOURCES.history, SOURCES.catalogue, SOURCES.expertSbre, SOURCES.expertBadger, SOURCES.expertCatalogue], svg: SOURCES.expertSvg, aliases: ["Waterman Expert", "Waterman Expert I", "Waterman Expert II", "Waterman Expert III", "威迪文 Expert", "威迪文 权威"], release: "1990–92", nib: "第一代及多数现代款为钢尖；官方目录另列 Expert 18K gold nib SKU，按尖刻字和商品号核对", fill: "Waterman cartridge/converter", material: "早期塑料；第二代常见漆面黄铜；现行 Expert III 的漆面与金属饰件依 SKU", dimensions: "Expert III 单支样本约合帽 141 mm、约 30–34 g；第一代塑料款明显更轻，不能混成一组", status: "现行与历史代际并存；Expert III 目录与地区库存随市场变化", boundary: "Expert 不是 Hémisphère 的加粗版，也不是 Carène 的包覆式尖。收藏资料通常把约 1995 第一代、约 2000 后第二代和 Expert III 作为可辨识阶段；钢尖、夹帽／螺纹结构、漆面黄铜重量和 18K 特别 SKU 都应以实物或目录核对。", variants: [{ key: "expert-gen1", name: "Expert first generation", releaseYear: "约 1990s 中期", notes: "轻质塑料笔身、三维两色钢尖和较紧的夹帽结构；FPN 样本约 1995，不把单支年份当官方精确首发年。", sourceKey: SOURCES.expertFpnGen1.key }, { key: "expert-gen2", name: "Expert second generation", releaseYear: "约 2000 起", notes: "常见漆面覆盖黄铜，重量明显上升；尖和帽夹结构也有变化，旧代维护经验不能直接套用。", sourceKey: SOURCES.expertFpnGen1.key }, { key: "expert-iii", name: "Expert III", releaseYear: "2010s–现行市场", notes: "SBREBrown 样本使用钢尖与 cartridge/converter；颜色、字幅与地区包装按商品号核对。", sourceKey: SOURCES.expertSbre.key }, { key: "expert-18k", name: "Expert 18K gold nib SKU", releaseYear: "目录／地区 SKU", notes: "官方目录列 18K gold nib，不能因为现代常见钢尖而把所有 Expert 写成钢尖。", sourceKey: SOURCES.expertCatalogue.key }] }),
];
