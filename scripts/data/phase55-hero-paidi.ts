import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

export const PHASE55_HERO_BRAND_ID = "LIfzzmbCfFPt";
export const PHASE55_PAIDI_BRAND_ID = "qpcW25Dw0fxW";
export const PHASE55_MIXED_PEN_ID = "eDbt5freEPtb";
/** Reserved stable IDs checked against the 2026-07-19 checkpoint-copy inventory. */
export const PHASE55_HERO_849_ID = "s55HERO849";
export const PHASE55_HERO_850_ID = "s55HERO850";
export const PHASE55_PAIDI_CENTURY_1_ID = "s55PAIDICENT1";

export const PHASE55_HERO_849_SLUG = "hero-849";
export const PHASE55_HERO_850_SLUG = "hero-850";
export const PHASE55_PAIDI_CENTURY_1_SLUG = "paidi-century-1";
export const PHASE55_MIXED_OLD_SLUG = "英雄派迪-一体尖";

const RETRIEVED = "2026-07-19";

function live(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.url,
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
  heroOfficial: live({
    key: "phase55-hero-official",
    title: "上海英雄（集团）有限公司官方首页与集团概况",
    url: "https://www.hero.com.cn/",
    registryKey: "hero-official-phase55",
    registryName: "上海英雄（集团）有限公司",
    sourceType: "official",
    tier: "primary",
    summary: "官方资料把集团旗下上海英雄金笔厂追溯到 1931 年，并按海派礼赠、经典典藏、时尚商务组织当前产品导航。",
    locator: "company profile, 1931 Hero Pen Factory, current product categories",
  }),
  integral: live({
    key: "phase55-hero-paidi-integral",
    title: "Crónicas Estilográficas: Back to China. II. Integral Nibs",
    url: "https://estilofilos.blogspot.com/2018/04/back-to-china-ii-integral-nibs.html",
    registryKey: "estilofilos-phase55-integral",
    registryName: "Crónicas Estilográficas",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "文章把 Hero 与 Paidi 的少数一体尖样本放在中国制笔语境中，并提到 849、850 与 Paidi Century。",
    locator: "integral nib collection caption, Hero 849/850 and Paidi production note",
  }),
  hero849: live({
    key: "phase55-hero-849-evan",
    title: "Evan's Pen Weekly: 英雄 849",
    url: "https://evan-fountainpens.blogspot.com/2011/05/849.html",
    registryKey: "evan-pen-weekly-phase55",
    registryName: "Evan's Pen Weekly",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary: "评测记录 Hero 849 的一体成型钢尖、按压式上墨、约 140/117 mm、28 g 与偏湿中等线条。",
    locator: "model identity, filling, dimensions, nib and cap observations",
  }),
  hero850: live({
    key: "phase55-hero-850-fpn",
    title: "Fountain Pen Network: Hero 850",
    url: "https://www.fountainpennetwork.com/forum/topic/64602-hero-850/",
    registryKey: "fountain-pen-network-phase55-hero850",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "contemporary_archive",
    summary: "论坛评测确认 Hero 850 中国制造、金属漆面、整片尖、约 5¼ 英寸、固定挤压囊与中等偏湿写感。",
    locator: "review opening, appearance, size, nib, filling and conclusion",
  }),
  hero850Community: live({
    key: "phase55-hero-850-community",
    title: "Fountain Pen Network: Hero fountain pens discussion",
    url: "https://www.fountainpennetwork.com/forum/topic/140778-hero-fountain-pens/",
    registryKey: "fountain-pen-network-phase55-hero850-community",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "community",
    summary: "玩家讨论补充 849/850 的相同 medium 标称、个体顺滑差异、漏墨与笔帽弹开风险。",
    locator: "849/850 user experience and variation comments",
  }),
  paidi: live({
    key: "phase55-paidi-century",
    title: "Crónicas Estilográficas: Matching (XVII). Paidi Century",
    url: "https://estilofilos.blogspot.com/2016/01/matching-xvii-paidi-century.html",
    registryKey: "estilofilos-phase55-paidi",
    registryName: "Crónicas Estilográficas",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary: "文章确认 Paidi Century 1 品牌关系、整片钢尖、约 1990s 线索、尺寸重量和 aerometric 自填充，并列 Century 5 与 oversize 变体。",
    locator: "Paidi brand identity, Century 1 dimensions, filling, variations and comments",
  }),
  heroBrandSvg: diagram(
    "phase55-hero-brand-svg",
    "Hero 品牌导航事实卡",
    "/images/library/site-original/hero-paidi/hero-brand.svg",
    "原创 factual SVG，区分 Hero 品牌入口、849/850 一体尖与 100/616/329 型号导航。",
  ),
  paidiBrandSvg: diagram(
    "phase55-paidi-brand-svg",
    "Paidi 品牌导航事实卡",
    "/images/library/site-original/hero-paidi/hero-paddy.svg",
    "原创 factual SVG，区分 Paidi 品牌关系、Century 1 与 integral nib 概念。",
  ),
  hero849Svg: diagram(
    "phase55-hero-849-svg",
    "Hero 849 事实卡",
    "/images/library/site-original/hero-paidi/hero-849.svg",
    "原创 factual SVG，区分一体成型钢尖、按压式上墨与约 140 mm 样本尺寸。",
  ),
  hero850Svg: diagram(
    "phase55-hero-850-svg",
    "Hero 850 事实卡",
    "/images/library/site-original/hero-paidi/hero-850.svg",
    "原创 factual SVG，区分整片式钢尖、金属漆面与固定挤压囊。",
  ),
  paidiCenturySvg: diagram(
    "phase55-paidi-century-svg",
    "Paidi Century 1 事实卡",
    "/images/library/site-original/hero-paidi/paidi-century-1.svg",
    "原创 factual SVG，区分整片钢尖、aerometric 自填充与 135 mm 样本尺寸。",
  ),
};

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function makeBrand(input: {
  key: string;
  id: string;
  slug: string;
  name: string;
  title: string;
  markdownFile: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  extra: CuratedSource[];
  svg: CuratedSource;
  aliases: string[];
  origin: string;
  milestone: { key: string; title: string; date: string; description: string; sourceKey: string };
}): CuratedEntityPack {
  const scopeKey = `${input.key}-scope`;
  const sources = [input.primary, input.secondary, ...input.extra, input.svg].filter((source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index);
  return {
    key: `phase55-${input.key}-v1`,
    entityId: input.id,
    expectedType: "brand",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.title,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: input.aliases.map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: input.primary.key })),
    sources,
    scopes: [{ key: scopeKey, scopeKey, productionState: "current", editionScope: "品牌历史与系列导航；具体型号、结构和维修史下沉到型号页" }],
    claims: [
      { key: `${input.key}-identity`, predicate: "brand_identity", objectText: input.name, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: "official brand identity", evidence: [{ key: `${input.key}-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: "official company and brand identity" }] },
      { key: `${input.key}-navigation`, predicate: "series_navigation", objectText: "品牌页只做可追溯导航，不把 integral nib 结构词当成具体型号，也不把品牌关系扩大成未经证实的制造断言。", factClass: "core", confidence: 0.98, sourceKey: input.secondary.key, locator: "professional secondary brand/model boundary", evidence: [{ key: `${input.key}-navigation-evidence`, sourceKey: input.secondary.key, scopeKey, locator: "brand name, model and structural boundary" }] },
    ],
    variants: [],
    media: [{ key: `${input.key}-primary`, title: `${input.name} 品牌导航事实卡（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影。", sourceUrl: input.svg.url, usageStatus: "primary" }],
    timeline: [
      { key: `${input.key}-origin`, title: `${input.name} 品牌资料起点`, eventType: "brand_founded", startDate: input.origin, circa: true, description: `${input.name} 的品牌历史入口，具体型号年代按来源继续拆分。`, sourceKey: input.primary.key },
      { key: input.milestone.key, title: input.milestone.title, eventType: "design_milestone", startDate: input.milestone.date, circa: true, description: input.milestone.description, sourceKey: input.milestone.sourceKey },
    ],
  };
}

function makePen(input: {
  key: string;
  id: string;
  slug: string;
  name: string;
  title: string;
  summary: string;
  markdownFile: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  extra: CuratedSource[];
  svg: CuratedSource;
  brandEntityId: string;
  aliases: string[];
  release: string;
  nib: string;
  fill: string;
  material: string;
  dimensions: string;
  origin_country?: string;
  status: string;
  boundary: string;
  variants: Array<{ key: string; name: string; notes: string; sourceKey: string; releaseYear?: string; productCode?: string }>;
}): CuratedEntityPack {
  const scopeKey = `${input.key}-scope`;
  const sources = [input.primary, input.secondary, ...input.extra, input.svg].filter((source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index);
  return {
    key: `phase55-${input.key}-v1`,
    entityId: input.id,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.title,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: input.aliases.map((alias, index) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: index === 0 ? input.primary.key : input.secondary.key })),
    sources,
    scopes: [{ key: scopeKey, scopeKey, productionState: "historical", editionScope: "具体型号；颜色、市场、批次与维修状态按 variant 或实物记录" }],
    claims: [
      { key: `${input.key}-identity`, predicate: "model_identity", objectText: input.summary, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: "model identity and dated source", evidence: [{ key: `${input.key}-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: "model title and product observation" }] },
      { key: `${input.key}-boundary`, predicate: "version_boundary", objectText: input.boundary, factClass: "core", confidence: 0.98, sourceKey: input.secondary.key, locator: "professional secondary model boundary", evidence: [{ key: `${input.key}-boundary-evidence`, sourceKey: input.secondary.key, scopeKey, locator: "model and sibling boundary" }, { key: `${input.key}-context-evidence`, sourceKey: SOURCES.integral.key, scopeKey, locator: "Hero/Paidi integral nib family context" }] },
      { key: `${input.key}-care`, predicate: "maintenance_boundary", objectText: "停产或库存整片尖钢笔应先清水吸排并检查囊体、帽盖和前端平整度；不要热水、酒精或强力撬拆，整片尖损伤通常不能用普通标准尖直接替换。", factClass: "core", confidence: 0.96, sourceKey: input.secondary.key, locator: "maintenance and user-report boundary", evidence: [{ key: `${input.key}-care-evidence`, sourceKey: input.secondary.key, scopeKey, locator: "filling, cap and nib maintenance observations" }] },
    ],
    variants: input.variants.map((variant) => ({ ...variant, variantKind: "market_sku" as const })),
    spec: {
      brandEntityId: input.brandEntityId,
      values: { series_name: input.name, release_year: input.release, origin_country: input.origin_country ?? "中国制笔体系；具体制造地与批次按来源核对", nib: input.nib, fill_system: input.fill, material: input.material, dimensions: input.dimensions, status: input.status },
      evidence: [
        evidence("brand_entity_id", `${input.key}-brand`, input.primary.key, scopeKey, "maker identity"),
        evidence("series_name", `${input.key}-series`, input.primary.key, scopeKey, "model title"),
        evidence("release_year", `${input.key}-release`, input.primary.key, scopeKey, "dated review or archival context"),
        evidence("origin_country", `${input.key}-origin`, input.primary.key, scopeKey, "brand/model context; no factory inference"),
        evidence("nib", `${input.key}-nib`, input.primary.key, scopeKey, "nib structure and writing observation"),
        evidence("fill_system", `${input.key}-fill`, input.primary.key, scopeKey, "filling system observation"),
        evidence("material", `${input.key}-material`, input.secondary.key, scopeKey, "material and construction observation"),
        evidence("dimensions", `${input.key}-dimensions`, input.primary.key, scopeKey, "dated dimensions or measured sample"),
        evidence("status", `${input.key}-status`, input.secondary.key, scopeKey, "historical/market boundary"),
      ],
    },
    media: [{ key: `${input.key}-primary`, title: `${input.name} 事实卡（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影，不表现真实比例、颜色、Logo 或刻字。", sourceUrl: input.svg.url, usageStatus: "primary" }],
    timeline: [{ key: `${input.key}-timeline`, title: `${input.name} 进入可见资料`, eventType: "model_released", startDate: input.release.match(/\d{4}/)?.[0] ?? "2000", circa: true, description: input.summary, sourceKey: input.primary.key }],
  };
}

const heroBrand = makeBrand({
  key: "hero-brand",
  id: PHASE55_HERO_BRAND_ID,
  slug: "hero",
  name: "英雄 Hero",
  title: "英雄 Hero：1931 上海制笔入口与一体尖型号导航",
  markdownFile: ".planning/content-research/hero-brand.md",
  primary: SOURCES.heroOfficial,
  secondary: SOURCES.integral,
  extra: [SOURCES.hero849, SOURCES.hero850],
  svg: SOURCES.heroBrandSvg,
  aliases: ["Hero", "英雄", "Shanghai Hero", "英雄金笔"],
  origin: "1931",
  milestone: { key: "hero-integral-milestone", title: "Hero／Paidi 一体尖型号进入资料视野", date: "2003", description: "公开资料把 Hero 849、850 与 Paidi Century 的整片尖生产线索放在 2000 年代初的上海英雄／江阴工艺笔厂语境中。", sourceKey: SOURCES.integral.key },
});

const paidiBrand = makeBrand({
  key: "paidi-brand",
  id: PHASE55_PAIDI_BRAND_ID,
  slug: "hero-paddy",
  name: "英雄派迪 Paidi",
  title: "Paidi／Hero Paddy：上海英雄体系中的品牌名与 Century 导航",
  markdownFile: ".planning/content-research/hero-paddy.md",
  primary: SOURCES.paidi,
  secondary: SOURCES.integral,
  extra: [SOURCES.heroOfficial],
  svg: SOURCES.paidiBrandSvg,
  aliases: ["Paidi", "Paddy", "Hero Paddy", "派迪", "英雄派迪"],
  origin: "1990s",
  milestone: { key: "paidi-century-milestone", title: "Paidi Century 1 成为具体型号入口", date: "2003", description: "Paidi Century 1、Century 5 与 oversize 变体在公开资料中被拆开描述；本页只导航到 Century 1。", sourceKey: SOURCES.paidi.key },
});

export const phase55HeroPaidiPacks: CuratedEntityPack[] = [
  heroBrand,
  makePen({ key: "hero-849", id: PHASE55_HERO_849_ID, slug: PHASE55_HERO_849_SLUG, name: "英雄 Hero 849", title: "Hero 849：按压式上墨与握位一体成型钢尖", summary: "Hero 849 是 Hero 体系中少见的一体成型钢尖型号，公开评测记录按压式上墨、约 140 mm 闭帽、28 g 样本与偏湿中等线条。", markdownFile: ".planning/content-research/hero-849.md", primary: SOURCES.hero849, secondary: SOURCES.integral, extra: [SOURCES.hero850Community, SOURCES.heroOfficial], svg: SOURCES.hero849Svg, brandEntityId: PHASE55_HERO_BRAND_ID, aliases: ["Hero 849", "英雄 849", "Hero849", "英雄一体尖 849"], release: "约 2005–2006（市场线索）", nib: "握位一体成型钢尖；公开样本约欧美 M，实际线宽按笔核对", fill: "按压式／挤压囊上墨", material: "笔身与笔帽漆面、底材及颜色按批次核对；评测样本沿用 Hero 187 轮廓", dimensions: "闭帽约 140 mm、开盖约 117 mm、约 28 g；直径未有稳定公开值", status: "历史／库存型号；未确认当前官方供应", boundary: "本页只指 Hero 849；Hero 850、Paidi Century 1 和 Hero 100/616/329 是 sibling。integral nib 是结构概念，不是额外型号或品牌，评测样本的尺寸、线宽和按压囊状态不能回填到其他型号。", variants: [{ key: "hero-849-observed", name: "Hero 849 公开评测样本", releaseYear: "约 2005–2006", notes: "Evan 评测记录闭帽约 140 mm、开盖约 117 mm、28 g、按压式上墨与偏湿中等线条；颜色和批次未统一。", sourceKey: SOURCES.hero849.key }] }),
  makePen({ key: "hero-850", id: PHASE55_HERO_850_ID, slug: PHASE55_HERO_850_SLUG, name: "英雄 Hero 850", title: "Hero 850：金属漆面与固定挤压囊的一体尖型号", summary: "Hero 850 是中国制造、金属漆面与整片式钢尖型号，论坛评测记录约 5¼ 英寸、固定挤压囊和中等偏湿的顺滑线条。", markdownFile: ".planning/content-research/hero-850.md", primary: SOURCES.hero850, secondary: SOURCES.integral, extra: [SOURCES.hero850Community, SOURCES.heroOfficial], svg: SOURCES.hero850Svg, brandEntityId: PHASE55_HERO_BRAND_ID, aliases: ["Hero 850", "英雄 850", "Hero850", "英雄一体尖 850"], release: "至少可见 2008 评测（生产起止未确认）", nib: "integral steel nib；Hero 标志与弧形刻纹，公开样本约 M", fill: "固定挤压囊／aerometric-like squeeze filler，瓶装墨水", material: "金属笔身与漆面；feed 公开评测推测为塑料，需以实物核对", dimensions: "约 5¼ 英寸（约 133 mm）级别；重量未有稳定公开值", status: "历史／库存型号；未确认当前官方供应", boundary: "本页只指 Hero 850；Hero 849 与 Paidi Century 1 通过 integral nib 结构关联但不共享材质、上墨、尺寸或图片。论坛样本与玩家反馈不能证明所有批次均为相同线宽、重量或漆面。", variants: [{ key: "hero-850-fpn", name: "Hero 850 FPN 评测样本", releaseYear: "2008", notes: "金属漆面、约 5¼ 英寸、固定挤压囊、Hero 标志与弧形刻纹，公开样本为顺滑偏湿 medium。", sourceKey: SOURCES.hero850.key }] }),
  paidiBrand,
  makePen({ key: "paidi-century-1", id: PHASE55_PAIDI_CENTURY_1_ID, slug: PHASE55_PAIDI_CENTURY_1_SLUG, name: "英雄派迪 Paidi Century 1", title: "Paidi Century 1：整片钢尖与 aerometric 自填充", summary: "Paidi Century 1 是上海英雄制笔体系中记录到的整片钢尖型号，公开资料给出约 1990s 线索、135 mm 闭帽、19.5 g 与 aerometric 自填充。", markdownFile: ".planning/content-research/paidi-century-1.md", primary: SOURCES.paidi, secondary: SOURCES.integral, extra: [SOURCES.hero849, SOURCES.heroOfficial], svg: SOURCES.paidiCenturySvg, brandEntityId: PHASE55_PAIDI_BRAND_ID, aliases: ["Paidi Century 1", "Paidi Century 1 fountain pen", "派迪 Century 1", "英雄派迪 Century 1", "派迪世纪 1"], release: "约 1990s（资料线索；2003 前后生产关系另有来源）", nib: "integral steel nib；与 Pilot Murex/Myu、Parker T1/Falcon 作结构比较", fill: "aerometric self-filling（自填充挤压囊）", material: "彩色外壳与金属结构线索；材料、漆面按实物核对", dimensions: "闭帽 135 mm、开盖 113.5 mm、套盖 141 mm、直径 10.0 mm、19.5 g、约 1.0 ml", status: "历史／库存型号；Century 5 与 oversized screw-cap 另立", boundary: "本页只承载 Paidi Century 1；Century 5、oversized screw-cap、Hero 849 与 Hero 850 另立。integral nib 是结构概念，Paidi 是品牌名，二者不应重新合成“英雄派迪一体尖”混名实体；本页规格来自公开样本，不能回填到其他 Century 变体。", variants: [{ key: "paidi-century-1-observed", name: "Paidi Century 1 公开档案样本", releaseYear: "约 1990s", notes: "闭帽 135 mm、开盖 113.5 mm、套盖 141 mm、直径 10.0 mm、19.5 g、约 1.0 ml；aerometric 自填充。", sourceKey: SOURCES.paidi.key }, { key: "paidi-century-family", name: "Century 5／oversized sibling（不并入本页）", releaseYear: "未确认", notes: "公开文章只确认存在其他 variation；无稳定规格，保留为后续独立身份研究线索。", sourceKey: SOURCES.paidi.key }] }),
];

export const phase55HeroPaidiRetire = {
  sourceEntityId: PHASE55_MIXED_PEN_ID,
  sourceSlug: PHASE55_MIXED_OLD_SLUG,
  targetEntityId: PHASE55_PAIDI_CENTURY_1_ID,
  targetPath: `/pen/${PHASE55_PAIDI_CENTURY_1_SLUG}`,
};
