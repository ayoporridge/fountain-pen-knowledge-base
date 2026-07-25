import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-25";
export const PHASE213_GRAPHOMATIC_ID = "hxjmiofFHTMa";

function live(input: {
  key: string;
  title: string;
  url: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
  independenceGroup?: string;
}): CuratedSource {
  return {
    ...input,
    registryKey: `${input.key}-registry`,
    independenceGroup: input.independenceGroup ?? `${input.key}-group`,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase213",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase213",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary:
      "本站原创 factual SVG；示意图，非产品照片，不证明真实内部结构、比例、材料、刻印或生产批次。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true`,
  };
}

const S = {
  richard: live({
    key: "phase213-graphomatic-richardspens",
    title: "Richard's Pens：The Graphomatic Inkmaker & Colonel",
    url: "https://www.richardspens.com/ref/profiles/inkmaker.htm",
    registryName: "Richard's Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "参考页把 Graph-O-Matic 写成战时 ink-making pen，并联系 Grieshaber Pen Company、Sager Pen Corporation 与 1942 年广告语境。",
    locator: "Graph-O-Matic, Grieshaber, Sager and March 1942 wartime profile",
    independenceGroup: "richardspens-graphomatic-inkmaker",
  }),
  ad: live({
    key: "phase213-graphomatic-ad",
    title: "Popular Mechanics：1942 Graph-O-Matic advertisement",
    url: "https://books.google.com/books?id=1dYDAAAAMBAJ&pg=PA189",
    registryName: "Popular Mechanics / Google Books archive",
    sourceType: "book",
    tier: "contemporary_archive",
    summary:
      "1942 年杂志页提供 Graph-O-Matic 的战时广告语境；广告措辞只作为历史销售材料，不当作今日机制或化学配方的独立证明。",
    locator: "Popular Mechanics 1942 page 189 Graph-O-Matic advertisement",
    independenceGroup: "popularmechanics-graphomatic-1942",
  }),
  fpn: live({
    key: "phase213-graphomatic-fpn",
    title: "Fountain Pen Network：Sager Pens discussion",
    url: "https://www.fountainpennetwork.com/forum/topic/125857-sager-pens-sm-sagers-daughter/",
    registryName: "Fountain Pen Network participants",
    sourceType: "forum",
    tier: "community",
    summary:
      "讨论含 Sager 家族口述与 Graphomatic、lucite reservoir 线索；作为识别假设和交叉线索，不替代广告或实物档案。",
    locator: "Sager family account, Graphomatic and lucite reservoir discussion",
  }),
  leadhead: live({
    key: "phase213-graphomatic-leadhead",
    title: "Leadhead's Pencil Blog：A Name That's Closer to Right",
    url: "https://leadheadpencils.blogspot.com/2020/04/a-name-thats-closer-to-right.html",
    registryName: "Leadhead's Pencil Blog / Jon Veley",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "收藏研究把 Graphomatic 与 Sager Barrel O' Ink、Grieshaber 制造线索和 Inkmaker／Colonel 名称分层，提供实物与命名的独立旁证。",
    locator: "Sager Barrel O' Ink, Grieshaber and Graphomatic naming boundary",
    independenceGroup: "leadhead-graphomatic-naming",
  }),
  svg: diagram(
    "phase213-graphomatic-svg",
    "Graphomatic 事实示意",
    "/images/library/site-original/phase213/graphomatic/graphomatic.svg",
  ),
} as const;

const scope = "graphomatic-brand-scope";

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  extra: string[] = [],
): CuratedEntityPack["claims"][number] {
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence: 0.9,
    sourceKey,
    locator,
    evidence: [sourceKey, ...extra].map((source, index) => ({
      key: `${key}-evidence-${index + 1}`,
      sourceKey: source,
      scopeKey: scope,
      locator,
    })),
  };
}

const brand: CuratedEntityPack = {
  key: "phase213-graphomatic",
  entityId: PHASE213_GRAPHOMATIC_ID,
  expectedType: "brand",
  expectedSlug: "graphomatic",
  canonicalName: "Graphomatic",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/graphomatic-phase213.md",
  storyTitle: "Graphomatic：战时 Graph-O-Matic 与特殊供墨想象",
  primarySourceKey: S.ad.key,
  depthTier: "B",
  aliases: [
    { alias: "Graphomatic", language: "en", sourceKey: S.richard.key },
    { alias: "Graph-O-Matic", language: "en", sourceKey: S.ad.key },
    { alias: "Graphomatic Inkmaker", language: "en", sourceKey: S.richard.key },
    { alias: "Graphomatic Colonel", language: "en", sourceKey: S.leadhead.key },
    { alias: "Graphomatic 战时供墨笔", language: "zh", sourceKey: S.richard.key },
  ],
  sources: [S.richard, S.ad, S.leadhead, S.fpn, S.svg],
  scopes: [{
    key: scope,
    scopeKey: scope,
    productionState: "historical",
    editionScope: "Graphomatic 品牌入口；Graph-O-Matic、Inkmaker、Colonel、Grieshaber 与 Sager 关系按来源分层",
  }],
  claims: [
    claim(
      "graphomatic-identity",
      "brand_identity",
      "Graphomatic 资料把 Graph-O-Matic 作为战时 ink-making pen，来源将其与 Grieshaber Pen Company、Sager Pen Corporation 和 1942 年广告语境联系起来；公司关系和具体生产责任仍需按单件档案核对。",
      S.richard.key,
      "Graph-O-Matic wartime identity and company boundary",
      [S.ad.key, S.leadhead.key],
    ),
    claim(
      "graphomatic-navigation",
      "brand_navigation",
      "Inkmaker 与 Colonel 是需要继续拆分的产品入口，不直接互作同义词；Graphomatic 也不能与 Pelikan Graphos 或同名铅笔混淆。",
      S.leadhead.key,
      "Inkmaker/Colonel naming and object boundary",
      [S.richard.key],
    ),
    claim(
      "graphomatic-wartime-context",
      "historical_context",
      "1942 年 Popular Mechanics 广告提供战时供墨销售语境；广告承诺只作为当年宣传材料，不当作今天已验证的化学配方或永久防漏证明。",
      S.ad.key,
      "1942 Graph-O-Matic advertisement wording boundary",
      [S.richard.key],
    ),
    claim(
      "graphomatic-source-boundary",
      "source_boundary",
      "Sager 家族口述和收藏博客可补充 lucite reservoir、Barrel O' Ink 与命名线索，但不能替代原始广告、专利或完整实物刻印。",
      S.fpn.key,
      "oral history and lucite reservoir clue",
      [S.leadhead.key],
    ),
    claim(
      "graphomatic-care",
      "maintenance_guidance",
      "特殊供墨实物应先确认 feed、reservoir、密封和干墨颗粒，再用常温水清洗；避免酒精、丙酮、热水和自行加入不明墨丸或化学物。",
      S.richard.key,
      "mechanism preservation and solvent boundary",
      [S.fpn.key],
    ),
    claim(
      "graphomatic-selection",
      "selection_guidance",
      "选购时要求完整刻印、笔尾与握位机构照片、广告或收藏来源以及维修披露；只有 Graphomatic 商品标题不足以证明 Inkmaker、Colonel 或真实制造商。",
      S.leadhead.key,
      "individual object identification checks",
      [S.richard.key, S.ad.key],
    ),
  ],
  variants: [
    {
      key: "graphomatic-inkmaker",
      name: "Graph-O-Matic Inkmaker",
      notes: "资料中的战时特殊供墨入口；具体 reservoir 和 feed 结构按实物核对。",
      sourceKey: S.richard.key,
      variantKind: "edition_group",
      releaseYear: "1942",
    },
    {
      key: "graphomatic-colonel",
      name: "Colonel／Colonel De Luxe 线索",
      notes: "与 Inkmaker 同见于 profile 或收藏资料，但目前不自动视为同一 SKU。",
      sourceKey: S.leadhead.key,
      variantKind: "edition_group",
    },
  ],
  media: [{
    key: "phase213-graphomatic-primary",
    title: "Graphomatic 战时供墨关系示意图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实内部结构、比例、材料、刻印或生产批次。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
  timeline: [
    {
      key: "phase213-graphomatic-1942",
      title: "Graph-O-Matic 出现在战时广告语境",
      eventType: "design_milestone",
      startDate: "1942",
      circa: false,
      description: "Popular Mechanics 广告与 Richard's Pens profile 将 Graph-O-Matic 放在 1942 年战时 ink-making pen 语境。",
      sourceKey: S.ad.key,
    },
    {
      key: "phase213-graphomatic-sager",
      title: "Graphomatic 与 Sager 线索并置",
      eventType: "brand_founded",
      startDate: "1940",
      circa: true,
      description: "收藏资料把 Graphomatic Corporation、Sager Pen Corporation 与 Grieshaber 制造／分销线索并列；具体公司关系不越过现有证据。",
      sourceKey: S.leadhead.key,
    },
  ],
};

export const phase213GraphomaticPacks: CuratedEntityPack[] = [brand];
