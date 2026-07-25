import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-25";
export const PHASE211_WAHL_BRAND_ID = "aijX3l7Eed6N";
export const PHASE211_WAHL_PEN_ID = "NbQ5cQ_jPBEO";

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
    registryKey: "fountain-pen-graph-editorial-phase211",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase211",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary:
      "本站原创 factual SVG；示意图，非产品照片，不证明真实比例、颜色、刻印、年份、金属含量或保存状态。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true`,
  };
}

const S = {
  fountainpen: live({
    key: "phase211-wahl-fountainpen",
    title: "FountainPen.it：Wahl Eversharp history and chronology",
    url: "https://fountainpen.it/Eversharp/en",
    registryName: "FountainPen.it",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary:
      "年代线记录 1914 The Wahl Company、1917 收购 Boston、Tempoint、1921 Wahl All Metal、1923 Signature、1926 Rosewood 与 1927 赛璐珞转折。",
    locator: "1914-1927 Wahl chronology, Boston acquisition, Tempoint, Signature and material transition",
    independenceGroup: "fountainpen-wahl-eversharp-history",
  }),
  penhero: live({
    key: "phase211-wahl-penhero",
    title: "PenHero：Wahl Engine Turned Designs 1919–1929",
    url: "https://www.penhero.com/PenGallery/Eversharp/WahlEversharpEngineTurnedDesigns.htm",
    registryName: "PenHero / Jim Mamoulides",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "目录研究按 1919–1929 年列出 Wahl 机刻和手工刻花样、夹型、尺寸与目录缺口，提醒旧库存和未收录型号会影响单支断代。",
    locator: "1919-1929 design chronology, clip, size and catalog boundary",
    independenceGroup: "penhero-wahl-engine-turned",
  }),
  richard: live({
    key: "phase211-wahl-richardspens",
    title: "Richard's Pens：The Wahl Pen",
    url: "https://www.richardspens.com/ref/profiles/wahl_pen.htm",
    registryName: "Richard's Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "早期 Wahl 资料以 Tempoint-like silhouette、roller clip 和 lever 为识别入口，并把 1925 年广告语境与硬橡胶设计联系起来。",
    locator: "early Wahl design vocabulary, roller clip, lever and 1925 advertisement context",
    independenceGroup: "richardspens-wahl-pen",
  }),
  catalog: live({
    key: "phase211-wahl-catalog",
    title: "Wahl 1925 catalogue scan",
    url: "https://www.legendaryleadcompany.com/uploads/7/2/7/3/72738107/wahl-eversharp-catalog-1925.pdf",
    registryName: "Legendary Lead Company catalog archive",
    sourceType: "book",
    tier: "contemporary_archive",
    summary:
      "1925 年目录扫描提供 Wahl 当年产品命名、材质与笔尖／款式广告语境；页面只作历史目录旁证，不把整本目录复制为正文。",
    locator: "1925 Wahl catalog product naming and advertising boundary",
    independenceGroup: "wahl-1925-catalog-scan",
  }),
  fpn: live({
    key: "phase211-wahl-fpn",
    title: "Fountain Pen Network：Early Wahl Sterling Pen",
    url: "https://www.fountainpennetwork.com/forum/topic/89439-early-wahl-sterling-pen/",
    registryName: "Fountain Pen Network participants",
    sourceType: "forum",
    tier: "community",
    summary:
      "玩家讨论指出早期 Wahl 金属 overlay 与硬橡胶内芯、Tempoint／Wahl 尖和 All Metal 之前后的边界；作为样本交叉线索而非唯一断代依据。",
    locator: "early Wahl overlay, hard rubber body, nib and pre-All-Metal boundary",
  }),
  svg: diagram(
    "phase211-wahl-pen-svg",
    "The Wahl Pen 事实示意",
    "/images/library/site-original/phase211/wahl/the-wahl-pen.svg",
  ),
} as const;

const brandScope = "wahl-brand-scope";
const penScope = "wahl-pen-scope";

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  extra: string[] = [],
): CuratedEntityPack["claims"][number] {
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence: 0.95,
    sourceKey,
    locator,
    evidence: [sourceKey, ...extra].map((source, index) => ({
      key: `${key}-evidence-${index + 1}`,
      sourceKey: source,
      scopeKey,
      locator,
    })),
  };
}

function specEvidence(
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return {
    key: `phase211-wahl-${fieldKey}`,
    fieldKey,
    sourceKey,
    scopeKey: penScope,
    locator,
  };
}

const brand: CuratedEntityPack = {
  key: "phase211-wahl-pen-brand",
  entityId: PHASE211_WAHL_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "wahl",
  canonicalName: "Wahl",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wahl-brand-phase211.md",
  storyTitle: "Wahl：从 Boston 与 Tempoint 走向 Wahl-Eversharp",
  primarySourceKey: S.fountainpen.key,
  depthTier: "B",
  aliases: [
    { alias: "Wahl", language: "en", sourceKey: S.fountainpen.key },
    { alias: "The Wahl Company", language: "en", sourceKey: S.fountainpen.key },
    { alias: "Wahl-Eversharp", language: "en", sourceKey: S.fountainpen.key },
    { alias: "Wahl 钢笔", language: "zh", sourceKey: S.penhero.key },
  ],
  sources: [S.fountainpen, S.penhero, S.richard, S.catalog, S.fpn, S.svg],
  scopes: [{
    key: brandScope,
    scopeKey: brandScope,
    productionState: "historical",
    editionScope: "Wahl 历史品牌导航；Boston、Tempoint、Wahl Pen、All Metal、Signature、Personal Point 与后期 Wahl-Eversharp 分层",
  }],
  claims: [
    claim(
      "wahl-brand-identity",
      "brand_identity",
      "Wahl 源自 1914 年的 The Wahl Company，1917 年收购 Boston Fountain Pen Company 后进入钢笔生产；Eversharp 铅笔和后来的 Wahl-Eversharp 是同一企业谱系中的不同阶段。",
      S.fountainpen.key,
      brandScope,
      "1914 The Wahl Company and 1917 Boston acquisition",
      [S.catalog.key],
    ),
    claim(
      "wahl-brand-navigation",
      "brand_navigation",
      "Tempoint、The Wahl Pen、All Metal、Signature、Personal Point、Deco Band、Equipoised 与 Doric 必须作为型号／系列层导航，不能全部并入一个早期 Wahl Pen 页面。",
      S.fountainpen.key,
      brandScope,
      "Tempoint, Wahl Pen, Signature and later model chronology",
      [S.penhero.key, S.richard.key],
    ),
    claim(
      "wahl-brand-material",
      "material_transition",
      "早期产品保留硬橡胶、overlay 和机刻装饰，1927 年起更积极采用赛璐珞；材料转折与夹子、填充结构和型号名称共同用于单支识别。",
      S.fountainpen.key,
      brandScope,
      "hard rubber, overlay and 1927 celluloid transition",
      [S.penhero.key],
    ),
  ],
  variants: [],
  media: [{
    key: "phase211-wahl-brand-primary",
    title: "Wahl 早期谱系示意图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、金属含量、刻印、年份或保存状态。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
  timeline: [
    {
      key: "phase211-wahl-company-1914",
      title: "The Wahl Company 进入书写工具谱系",
      eventType: "brand_founded",
      startDate: "1914",
      circa: false,
      description: "FountainPen.it 将 The Wahl Company 的成立与 Wahl Adding Machine 的书写工具扩张放在 1914 年。",
      sourceKey: S.fountainpen.key,
    },
    {
      key: "phase211-wahl-boston-1917",
      title: "Wahl 收购 Boston Fountain Pen Company",
      eventType: "acquisition",
      startDate: "1917",
      circa: false,
      description: "1917 年收购 Boston 后，Wahl 将硬橡胶、轮夹和早期填充经验带进 Tempoint 与 Wahl Pen 产品线。",
      sourceKey: S.fountainpen.key,
    },
    {
      key: "phase211-wahl-celluloid-1927",
      title: "Wahl 采用彩色赛璐珞",
      eventType: "design_milestone",
      startDate: "1927",
      circa: false,
      description: "资料把 Jade Green、Royal Blue、Coral 等赛璐珞颜色放在 1927 年的材料转折上。",
      sourceKey: S.fountainpen.key,
    },
  ],
};

const pen: CuratedEntityPack = {
  key: "phase211-wahl-pen",
  entityId: PHASE211_WAHL_PEN_ID,
  expectedType: "pen",
  expectedSlug: "the-wahl-pen",
  canonicalName: "The Wahl Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wahl-pen-phase211.md",
  storyTitle: "The Wahl Pen：Boston 遗产与硬橡胶时代",
  primarySourceKey: S.richard.key,
  depthTier: "A",
  aliases: [
    { alias: "The Wahl Pen", language: "en", sourceKey: S.richard.key },
    { alias: "Wahl Pen", language: "en", sourceKey: S.fountainpen.key },
    { alias: "Wahl Signature Pen", language: "en", sourceKey: S.fountainpen.key },
    { alias: "早期 Wahl 钢笔", language: "zh", sourceKey: S.penhero.key },
  ],
  sources: [S.fountainpen, S.penhero, S.richard, S.catalog, S.fpn, S.svg],
  scopes: [{
    key: penScope,
    scopeKey: penScope,
    productionState: "historical",
    editionScope: "1917–1920 年代的 The Wahl Pen 早期产品入口；Boston／Tempoint、硬橡胶、轮夹、lever 与笔尖编号按单支核对",
  }],
  claims: [
    claim(
      "wahl-pen-identity",
      "model_identity",
      "The Wahl Pen 是 1917 年 Boston 收购后、1921 年前后逐步直接使用的早期 Wahl 钢笔称呼，覆盖一组相近而非完全统一的硬橡胶和早期过渡样本。",
      S.fountainpen.key,
      penScope,
      "1917 Boston acquisition, Tempoint and 1921 Wahl naming transition",
      [S.richard.key, S.catalog.key],
    ),
    claim(
      "wahl-pen-material",
      "material_boundary",
      "代表性样本可见黑／红 hard rubber、mottled hard rubber、chasing 与 overlay；1926 Rosewood 和 1927 彩色赛璐珞属于材料／年代过渡，不能全写成同一规格。",
      S.fountainpen.key,
      penScope,
      "hard rubber, Rosewood and 1927 celluloid transition",
      [S.penhero.key],
    ),
    claim(
      "wahl-pen-clip",
      "clip_boundary",
      "Roller Clip 是早期 Wahl 的重要识别线索，较大笔可能使用轮夹；满足携带规范的样本还可能出现 welded Tulip Clip，夹子仍需检查是否原配。",
      S.richard.key,
      penScope,
      "roller clip, Soldier/Tulip clip and early Wahl design",
      [S.fountainpen.key, S.fpn.key],
    ),
    claim(
      "wahl-pen-filler",
      "filling_system",
      "The Wahl Pen 家族没有统一填充系统；常见硬橡胶样本使用 lever filler 与橡胶墨囊，更早的 Boston-derived overlay 或特殊样本可能是 eyedropper，必须按单支核对。",
      S.richard.key,
      penScope,
      "Boston-derived filling and lever boundary",
      [S.fpn.key, S.catalog.key],
    ),
    claim(
      "wahl-pen-nib",
      "nib_boundary",
      "Tempoint、Wahl 或 Signature 尖和 #2、#4、#6 等尺寸可见于早期资料；笔尖容易被替换，尖刻字只能与桶身、夹子和材料共同判断。",
      S.fountainpen.key,
      penScope,
      "Tempoint, Wahl and Signature nib naming and sizes",
      [S.penhero.key, S.fpn.key],
    ),
    claim(
      "wahl-pen-care",
      "maintenance_guidance",
      "硬橡胶要避开强日晒、酒精、热水和过度抛光；使用前检查墨囊、section、feed、lever pivot、帽口与 overlay，不要直接套现代 converter。",
      S.richard.key,
      penScope,
      "hard rubber preservation and sac/lever repair boundary",
      [S.fpn.key],
    ),
    claim(
      "wahl-pen-selection",
      "selection_guidance",
      "选购时记录 barrel imprint、nib imprint、clip、cap top、填充结构和尺寸；仅有 Wahl 商品标题不足以区分 Boston rebrand、Tempoint、早期 Wahl Pen 与后期 Wahl-Eversharp。",
      S.penhero.key,
      penScope,
      "catalog gaps, clip, nib, size and individual identification",
      [S.richard.key, S.catalog.key],
    ),
  ],
  variants: [
    {
      key: "wahl-pen-tempoint-transition",
      name: "Boston／Tempoint 过渡样本",
      notes: "保留 Boston 设计或 Tempoint 尖刻字的早期样本；名称和结构按单支资料判断。",
      sourceKey: S.fountainpen.key,
      variantKind: "edition_group",
      releaseYear: "1917–1922",
    },
    {
      key: "wahl-pen-hard-rubber",
      name: "硬橡胶 Wahl Pen",
      notes: "黑色、红色、mottled 或 chasing hard rubber；轮夹、Tulip Clip、overlay 和 lever 可能组合变化。",
      sourceKey: S.richard.key,
      variantKind: "material",
      releaseYear: "约 1921–1926",
    },
    {
      key: "wahl-pen-rosewood",
      name: "Rosewood 色硬橡胶",
      notes: "资料把 Rosewood 色放在约 1926 年；褪色和后配件会改变实物观感。",
      sourceKey: S.fountainpen.key,
      variantKind: "color",
      releaseYear: "约 1926",
    },
    {
      key: "wahl-pen-early-celluloid",
      name: "早期彩色赛璐珞过渡",
      notes: "Jade Green、Royal Blue、Coral 等颜色出现在 1927 年转折；不自动等于后来的 Personal Point 或 Doric。",
      sourceKey: S.fountainpen.key,
      variantKind: "material",
      releaseYear: "约 1927",
    },
  ],
  spec: {
    brandEntityId: PHASE211_WAHL_BRAND_ID,
    values: {
      series_name: "Early Wahl Pen / The Wahl Pen",
      release_year: "1917–1920 年代；1921 前后逐步直接使用 Wahl Pen 名称",
      origin_country: "美国 Chicago（Wahl Company）",
      nib: "Tempoint、Wahl 或 Signature 尖；#2、#4、#6 等尺寸按单支",
      fill_system: "常见 lever filler + 橡胶墨囊；更早 overlay 样本可能为 eyedropper",
      material: "hard rubber、mottled hard rubber、overlay；约 1926 Rosewood，约 1927 彩色 celluloid",
      dimensions: "小号 ringtop、常规与 oversize 并存；以单支合帽／去帽实测",
      weight: "公开目录未给可覆盖全族的统一值",
      price_range: "历史目录价格随尺寸、金属饰件和笔尖变化；不作为当前估值",
      status: "历史产品谱系，后续型号由 Wahl-Eversharp 独立导航",
    },
    evidence: [
      specEvidence("brand_entity_id", S.fountainpen.key, "Wahl maker and Boston acquisition"),
      specEvidence("series_name", S.catalog.key, "1925 catalog naming"),
      specEvidence("release_year", S.fountainpen.key, "1917-1921 naming transition"),
      specEvidence("origin_country", S.fountainpen.key, "The Wahl Company Chicago context"),
      specEvidence("nib", S.penhero.key, "nib markings and sizes in catalog research"),
      specEvidence("fill_system", S.richard.key, "early Wahl lever and Boston-derived filling boundary"),
      specEvidence("material", S.fountainpen.key, "hard rubber to celluloid timeline"),
      specEvidence("dimensions", S.penhero.key, "sizes and clip context"),
      specEvidence("weight", S.catalog.key, "no universal family weight asserted"),
      specEvidence("price_range", S.catalog.key, "historical catalog pricing context"),
      specEvidence("status", S.fountainpen.key, "later Wahl-Eversharp boundary"),
    ],
  },
  media: [{
    key: "phase211-wahl-pen-primary",
    title: "The Wahl Pen 事实示意图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、金属含量、刻印、年份或保存状态。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
  timeline: [
    {
      key: "phase211-wahl-pen-1917",
      title: "Boston 设计遗产进入 Wahl",
      eventType: "acquisition",
      startDate: "1917",
      circa: false,
      description: "Wahl 收购 Boston 后，轮夹、硬橡胶与早期填充经验成为 Tempoint 和后续 Wahl Pen 的基础。",
      sourceKey: S.fountainpen.key,
    },
    {
      key: "phase211-wahl-pen-1921",
      title: "Wahl Pen 名称逐步取代 Tempoint",
      eventType: "model_released",
      startDate: "1921",
      circa: true,
      description: "资料把 1921 年视为 Wahl All Metal 与直接使用 Wahl 名称的重要转折；早期硬橡胶样本仍与 Tempoint 结构相连。",
      sourceKey: S.fountainpen.key,
    },
    {
      key: "phase211-wahl-pen-1923",
      title: "Wahl Signature 硬橡胶阶段",
      eventType: "design_milestone",
      startDate: "1923",
      circa: false,
      description: "1923 年起的硬橡胶笔常被收藏者称作 Signature，但公司目录名称与单支尖刻字仍需分别核对。",
      sourceKey: S.fountainpen.key,
    },
  ],
};

export const phase211WahlPenPacks: CuratedEntityPack[] = [brand, pen];
