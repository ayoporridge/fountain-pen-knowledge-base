import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE106_SHEAFFER_ID = "tVXnzDSFCcPP";
export const PHASE106_CONNAISSEUR_ID = "hbOcg60TD2lr";
export const PHASE106_CONNAISSEUR_RAW_SLUG = "sheaffer-s-connaisseur";
export const PHASE106_CONNAISSEUR_SLUG = "sheaffer-connaisseur";
export const PHASE106_IMPERIAL_ID = "phase106-sheaffer-imperial";
export const PHASE106_IMPERIAL_SLUG = "sheaffer-imperial";
export const PHASE106_ICON_ID = "phase106-sheaffer-icon";
export const PHASE106_ICON_SLUG = "sheaffer-icon";

const RETRIEVED = "2026-07-21";
const SVG_PATH =
  "/images/library/site-original/phase106/sheaffer/sheaffer-connaisseur-imperial-icon.svg";

function webSource(
  input: Omit<
    CuratedSource,
    "retrievedAt" | "allowedUse" | "homepageUrl" | "archiveUrl"
  > & { locator: string },
): CuratedSource {
  const { locator, ...source } = input;
  return {
    ...source,
    homepageUrl: new URL(source.url).origin,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: source.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}`,
  };
}

const diagram: CuratedSource = {
  key: "phase106-sheaffer-triptych-svg",
  registryKey: "fountain-pen-graph-editorial-phase106",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase106",
  title: "Sheaffer Connaisseur、Imperial 与 Icon 事实边界图",
  url: SVG_PATH,
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  summary: "本站原创三分面 factual SVG；示意图，非产品照片。",
  allowedUse: "store_full",
  license: "site-original",
  archiveUrl: SVG_PATH,
  archiveLocator: `project-public-asset:${SVG_PATH};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;sku-replica=false;dimensions=1600x900`,
};

const SOURCES = {
  connaisseurWriteup: webSource({
    key: "phase106-connaisseur-writeup",
    registryKey: "sheaffertarga-connaisseur-history",
    registryName: "SheafferTarga.com archive",
    sourceType: "blog",
    tier: "contemporary_archive",
    independenceGroup: "sheaffertarga-connaisseur-history",
    title: "Connaisseur Write Up",
    url: "https://www.sheaffertarga.com/Connaisseur/Connaisseur%20Write%20Up.html",
    author: null,
    summary:
      "逐款资料记录 1986 标准黑树脂款、18K 单色卷草纹尖、1988 欧洲系列、1989/1991 市场节点以及 Grande 的 18K palladium-chevron 尖。",
    locator:
      "lines 0-17 (1986 standard resin; 18K mono-tone scrolled nib; 1988 European collection; 1989/1991 market entries; Grande naming and 18K palladium-chevron nib); lines 27-56 (country stamps and later standard finishes)",
  }),
  connaisseurBinder: webSource({
    key: "phase106-richards-connaisseur-newsletter",
    registryKey: "richardspens-connaisseur-history",
    registryName: "Richard’s Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "richardspens",
    title: "Nib Noise, December 2021 — Sheaffer/Zorn Connaisseur context",
    url: "https://www.richardspens.com/pdf/nn/2021/12.pdf",
    author: "Richard Binder",
    publishedAt: "2021-12-01",
    summary:
      "独立专业资料将 Sheaffer/Zorn Connaisseur、No Nonsense、Dan Reppert 与 Ron Zorn 放入同一设计史讨论；只用于身份边界交叉核对。",
    locator:
      "PDF page 3 (viewer index P2), paragraph beginning 'Sheaffer/Zorn Connaisseur' and the following No Nonsense/Connaisseur design-history sentence",
  }),
  connaisseurDealerCatalog: webSource({
    key: "phase106-gopens-connaisseur-1994",
    registryKey: "gopens-catalog-48",
    registryName: "GoPens",
    sourceType: "retailer",
    tier: "retailer",
    independenceGroup: "gopens",
    title: "Vintage Pen Catalog 48",
    url: "https://www.gopens.com/PDF/Catalog48.pdf",
    author: "Gary and Myrna Lehrer",
    summary:
      "经销商目录 item 95 记录一支 1994 fluted sterling silver Connaisseur 为 cartridge/converter fill，并注明 converter；只约束该目录样本。",
    locator:
      "PDF catalog item 95: 1994 Sheaffer Connaisseur, fluted sterling silver, cartridge/converter fill, 18K medium nib, converter included",
  }),
  connaisseurChronology: webSource({
    key: "phase106-penhero-sheaffer-chronology",
    registryKey: "penhero-sheaffer-chronology",
    registryName: "PenHero",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "penhero",
    title: "Sheaffer Penography",
    url: "https://www.penhero.com/PenGallery/Sheaffer/Sheaffer.htm",
    author: "Jim Mamoulides",
    summary:
      "Sheaffer 型号年代与相邻产品线索引；用于 family chronology，不作为每个 Connaisseur 饰面的唯一规格来源。",
    locator:
      "Sheaffer Penography chronology entry for Connaisseur and adjacent late-twentieth-century lines; family-level chronology only",
  }),
  imperialEarly: webSource({
    key: "phase106-penhero-imperials-early",
    registryKey: "penhero-imperials-early",
    registryName: "PenHero",
    sourceType: "blog",
    tier: "contemporary_archive",
    independenceGroup: "penhero",
    title: "Early Sheaffer Imperials 1961–1962",
    url: "https://www.penhero.com/PenGallery/Sheaffer/SheafferImperialsEarly.htm",
    author: "Jim Mamoulides",
    publishedAt: "2001-12-31",
    summary:
      "资料依据同期目录与广告整理 early Imperial family、Touchdown/cartridge 分流及 IV、VI、VIII 各自帽材、14K inlaid nib 与识别项目。",
    locator:
      "lines 89-118 (family, Touchdown/cartridge and naming boundary); Imperial IV identification guide lines 193-216; Imperial VI identification guide lines 219-236; Imperial VIII identification guide section",
  }),
  imperialInlaid: webSource({
    key: "phase106-penhero-inlaid-evolution",
    registryKey: "penhero-sheaffer-inlaid-evolution",
    registryName: "PenHero",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "penhero-inlaid-study",
    title: "The Evolution of the Sheaffer Inlaid Nib 1959–Present",
    url: "https://www.penhero.com/PenGallery/Sheaffer/SheafferInlaidNibs.htm",
    author: "Jim Mamoulides",
    publishedAt: "2001-12-31",
    summary:
      "笔尖谱系资料区分 PFM 与 Imperial，并记录 Imperial 1961–约1998、Touchdown 与 cartridge/converter 并存以及非 inlaid 版本。",
    locator:
      "lines 85-102, especially Imperial 1961-c1998 lines 95-102 (smaller PFM-inspired line, no Snorkel, Touchdown and cartridge/converter, nib variation)",
  }),
  iconOfficial: webSource({
    key: "phase106-sheaffer-icon-9108-official",
    registryKey: "sheaffer-official-current-phase106",
    registryName: "Sheaffer official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sheaffer-official",
    title: "Sheaffer ICON 9108 Matte Black Fountain Pen With Gloss Black Trim",
    url: "https://sheaffer.com/products/sheaffer%C2%AE-icon-9108-matte-black-fountain-pen-with-gloss-black-trim-medium",
    summary:
      "当前官方 9108 商品页列出 Medium、Matte Black/gloss black trim、Art Deco silhouette、wraparound clip、polished stainless-steel nib、piston converter 与两枚 Classic cartridges。",
    locator:
      "live lines 110-124 (title, merchant SKU E0910853/SH34234, Medium); lines 193-209 (Art Deco, wraparound clip, finish, polished stainless-steel nib, piston converter, blue/black Classic cartridges)",
  }),
  iconCollection: webSource({
    key: "phase106-sheaffer-icon-collection-official",
    registryKey: "sheaffer-official-current-phase106",
    registryName: "Sheaffer official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sheaffer-official",
    title: "Sheaffer Icon collection",
    url: "https://sheaffer.com/collections/sheaffer-icon?view=boost-pfs-original",
    summary:
      "当前官方 collection 仍列 9108 Matte Black fountain pen；其他颜色和书写系统仅用于证明需要逐 SKU 核验。",
    locator:
      "live collection product grid entry 'Sheaffer ICON 9108 Matte Black Fountain Pen With Gloss Black Trim'; retrieved 2026-07-21",
  }),
  iconReview: webSource({
    key: "phase106-penaddict-icon-review",
    registryKey: "penaddict-icon-review",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "penaddict",
    title: "Sheaffer Icon Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2022/1/19/sheaffer-icon-fountain-pen-review",
    author: "Jeff Abbott",
    publishedAt: "2022-01-19",
    summary:
      "独立专业评测描述一支 fine-nib Icon 样本的金属笔身、钢尖、converter 与 cartridges；主观写感、价格和样本配置不泛化。",
    locator:
      "lines 902-925, especially 908 (fine-nib sample), 912-917 (sample construction, steel nib experience, two cartridges and converter), with all judgments limited to the reviewed unit",
  }),
} satisfies Record<string, CuratedSource>;

function specEvidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function primaryMedia(panel: string) {
  return [
    {
      key: `phase106-${panel}-primary-media`,
      title: `Sheaffer ${panel} 分面事实图（示意图，非产品照片）`,
      sourceKey: diagram.key,
      localPath: diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: `Fountain Pen Graph 本站原创三分面 factual SVG；本页使用 ${panel} 分面。示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、笔尖、材质、包装、库存或具体 SKU。`,
      sourceUrl: diagram.url,
      usageStatus: "primary" as const,
    },
  ];
}

const connaisseurScope = "phase106-connaisseur-family";
export const phase106SheafferConnaisseurPack: CuratedEntityPack = {
  key: "phase106-sheaffer-connaisseur-v1",
  entityId: PHASE106_CONNAISSEUR_ID,
  expectedType: "pen",
  expectedSlug: PHASE106_CONNAISSEUR_SLUG,
  canonicalName: "Sheaffer Connaisseur",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sheaffer-connaisseur-phase106.md",
  storyTitle: "Sheaffer Connaisseur：先辨认标准或 Grande，再谈后期高阶线",
  primarySourceKey: SOURCES.connaisseurWriteup.key,
  depthTier: "A",
  aliases: [
    { alias: "Sheaffer Connaisseur", language: "en", sourceKey: SOURCES.connaisseurWriteup.key },
    { alias: "Grande Connaisseur", language: "en", sourceKey: SOURCES.connaisseurWriteup.key },
    { alias: "犀飞利 Connaisseur", language: "zh", sourceKey: SOURCES.connaisseurBinder.key },
  ],
  sources: [
    SOURCES.connaisseurWriteup,
    SOURCES.connaisseurBinder,
    SOURCES.connaisseurDealerCatalog,
    SOURCES.connaisseurChronology,
    diagram,
  ],
  scopes: [
    {
      key: connaisseurScope,
      scopeKey: connaisseurScope,
      productionState: "historical",
      nibScope: "开放式尖家族；18K 单色卷草纹只绑定标准树脂资料，Grande 的 18K palladium-chevron 另列。",
      materialScope: "标准树脂、Laque 与贵金属饰面按逐款 locator；不建立全族统一材料。",
      editionScope: "1986 起 family；standard 与 Grande 分开，市场时间不等同全球生产起点。",
    },
  ],
  claims: [
    {
      key: "phase106-connaisseur-identity",
      predicate: "model_identity",
      objectText:
        "Connaisseur 是 1986 年起的独立 Sheaffer 开放式尖家族；首支黑色标准树脂款与 Grande、Laque 等版本必须分别记录。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: SOURCES.connaisseurWriteup.key,
      locator: "lines 0-17 and 27-56",
      evidence: [
        { key: "phase106-connaisseur-writeup-evidence", sourceKey: SOURCES.connaisseurWriteup.key, scopeKey: connaisseurScope, locator: "lines 0-17: 1986 start, standard resin 18K nib, European/Grande sequence" },
        { key: "phase106-connaisseur-independent-evidence", sourceKey: SOURCES.connaisseurBinder.key, scopeKey: connaisseurScope, locator: "PDF page 3: Sheaffer/Zorn Connaisseur and No Nonsense design-history context" },
      ],
    },
    {
      key: "phase106-connaisseur-variant-boundary",
      predicate: "variant_boundary",
      objectText:
        "标准树脂款的 18K 单色卷草纹尖与 Grande 的 18K palladium-chevron 尖分别有 locator；尺寸、尖宽、重量和饰面不跨版本补猜。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: SOURCES.connaisseurWriteup.key,
      locator: "lines 2, 15-17, 27-56",
      evidence: [
        { key: "phase106-connaisseur-standard-nib", sourceKey: SOURCES.connaisseurWriteup.key, scopeKey: connaisseurScope, locator: "line 2: standard resin pens and 18K mono-tone scrolled nib" },
        { key: "phase106-connaisseur-grande-nib", sourceKey: SOURCES.connaisseurWriteup.key, scopeKey: connaisseurScope, locator: "lines 15-17: Grande naming/market and 18K palladium-chevron scrolled nib" },
      ],
    },
  ],
  variants: [
    { key: "phase106-connaisseur-standard", name: "Standard resin Connaisseur", releaseYear: "1986", notes: "首发黑树脂与后续标准饰面；18K mono-tone scrolled nib 只绑定该资料范围。", sourceKey: SOURCES.connaisseurWriteup.key, variantKind: "variant" },
    { key: "phase106-connaisseur-grande", name: "Grande Connaisseur", releaseYear: "1988 起的 European/Grande 路线", notes: "18K scrolled nib with palladium chevron；England/USA 标记按实物和批次核对。", sourceKey: SOURCES.connaisseurWriteup.key, variantKind: "edition_group" },
  ],
  spec: {
    brandEntityId: PHASE106_SHEAFFER_ID,
    values: {
      series_name: "Sheaffer Connaisseur family（standard / Grande 分列）",
      release_year: "1986 起；1988/1989/1991 为资料中的系列或市场节点",
      origin_country: "England/USA 标记见部分 Grande；具体款按刻印核对",
      nib: "开放式尖；标准树脂款与 Grande 各自有 18K locator，不泛化尖宽或弹性",
      fill_system:
        "1994 fluted sterling silver 目录样本为 cartridge/converter；不把该 converter 配置泛化到全系",
      material: "标准树脂、Laque 与贵金属饰面按具体版本，不设全族统一材质",
      dimensions: "standard 与 Grande 分开；本包不发布无逐款 locator 的统一尺寸",
      status: "历史后期家族；具体停产时间与市场按版本资料核对",
    },
    evidence: [
      specEvidence("brand_entity_id", "phase106-connaisseur-brand", SOURCES.connaisseurWriteup.key, connaisseurScope, "Sheaffer Connaisseur page title and model sequence"),
      specEvidence("series_name", "phase106-connaisseur-series", SOURCES.connaisseurWriteup.key, connaisseurScope, "lines 0-17: Connaisseur and Grande naming"),
      specEvidence("release_year", "phase106-connaisseur-release", SOURCES.connaisseurWriteup.key, connaisseurScope, "lines 2 and 15: 1986 start and March 1988 European collection"),
      specEvidence("origin_country", "phase106-connaisseur-origin", SOURCES.connaisseurWriteup.key, connaisseurScope, "lines 15 and 27: made in England and later England/USA stamps for listed Grande models"),
      specEvidence("nib", "phase106-connaisseur-nib", SOURCES.connaisseurWriteup.key, connaisseurScope, "lines 2 and 17: scoped standard/Grande 18K nib statements"),
      specEvidence("fill_system", "phase106-connaisseur-fill", SOURCES.connaisseurDealerCatalog.key, connaisseurScope, "PDF catalog item 95: 1994 fluted sterling silver Connaisseur is cartridge/converter fill and includes a converter; variant-specific evidence only"),
      specEvidence("material", "phase106-connaisseur-material", SOURCES.connaisseurWriteup.key, connaisseurScope, "lines 2, 15, 31-53: resin, Laque and named finish rows"),
      specEvidence("dimensions", "phase106-connaisseur-dimensions", SOURCES.connaisseurWriteup.key, connaisseurScope, "standard and Grande are separate rows; no cross-family number promoted"),
      specEvidence("status", "phase106-connaisseur-status", SOURCES.connaisseurChronology.key, connaisseurScope, "historical chronology entry; no unsupported exact discontinuation year"),
    ],
  },
  media: primaryMedia("Connaisseur"),
  timeline: [
    { key: "phase106-connaisseur-1986", title: "标准黑树脂 Connaisseur", eventType: "model_released", startDate: "1986", circa: false, description: "逐款资料把 Connaisseur line 的起点放在 1986 年黑树脂标准款。", sourceKey: SOURCES.connaisseurWriteup.key },
    { key: "phase106-connaisseur-1988", title: "European / Grande 路线", eventType: "design_milestone", startDate: "1988-03", circa: false, description: "European collection 随后在美国/加拿大使用 Grande 名称；市场与生产节点不混写。", sourceKey: SOURCES.connaisseurWriteup.key },
  ],
};

const imperialScope = "phase106-imperial-family";
export const phase106SheafferImperialPack: CuratedEntityPack = {
  key: "phase106-sheaffer-imperial-v1",
  entityId: PHASE106_IMPERIAL_ID,
  expectedType: "pen",
  expectedSlug: PHASE106_IMPERIAL_SLUG,
  canonicalName: "Sheaffer Imperial",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sheaffer-imperial-phase106.md",
  storyTitle: "Sheaffer Imperial：按 Roman numeral、笔尖与供墨辨认历史家族",
  primarySourceKey: SOURCES.imperialEarly.key,
  depthTier: "A",
  aliases: [
    { alias: "Sheaffer Imperial", language: "en", sourceKey: SOURCES.imperialEarly.key },
    { alias: "Imperial", language: "en", sourceKey: SOURCES.imperialInlaid.key },
    { alias: "犀飞利 Imperial", language: "zh", sourceKey: SOURCES.imperialEarly.key },
  ],
  sources: [SOURCES.imperialEarly, SOURCES.imperialInlaid, diagram],
  scopes: [
    {
      key: imperialScope,
      scopeKey: imperialScope,
      productionState: "historical",
      nibScope: "笔尖按子型变化；IV/VI/VIII 的 14K inlaid locator 不覆盖 I/II/III、Dolphin、Triumph 或 revival。",
      materialScope: "IV plastic、VI stainless cap、VIII gold-filled cap 分别记录；不建立全族统一帽材。",
      editionScope: "1961 起 Imperial family；PFM、Dolphin、Triumph Imperial、Targa 与 Legacy 仅作边界/sibling。",
    },
  ],
  claims: [
    {
      key: "phase106-imperial-identity",
      predicate: "model_identity",
      objectText:
        "Imperial 是 1961 年起的细长 PFM-inspired 历史家族，初期以 Touchdown 简化 Snorkel，并很快增加 cartridge 版本。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: SOURCES.imperialEarly.key,
      locator: "lines 89-97",
      evidence: [
        { key: "phase106-imperial-early-family", sourceKey: SOURCES.imperialEarly.key, scopeKey: imperialScope, locator: "lines 89-97: 1961 line, Touchdown simplification and cartridge follow-up" },
        { key: "phase106-imperial-inlaid-family", sourceKey: SOURCES.imperialInlaid.key, scopeKey: imperialScope, locator: "lines 95-102: 1961-c1998 boundary and multiple filling/nib forms" },
      ],
    },
    {
      key: "phase106-imperial-family-boundary",
      predicate: "related_model_boundary",
      objectText:
        "PFM、Dolphin 500/800/1000、1970s Triumph、1990s Triumph Imperial、Targa 与 Legacy 不能作为 Imperial family 的统一默认规格。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: SOURCES.imperialEarly.key,
      locator: "lines 99-118",
      evidence: [
        { key: "phase106-imperial-naming-boundary", sourceKey: SOURCES.imperialEarly.key, scopeKey: imperialScope, locator: "lines 99-118: Lifetime/Dolphin/Triumph naming and collector grouping caveats" },
        { key: "phase106-imperial-nib-boundary", sourceKey: SOURCES.imperialInlaid.key, scopeKey: imperialScope, locator: "lines 95-102: inlaid, shortened Triumph and semi-inlaid variants" },
      ],
    },
  ],
  variants: [
    { key: "phase106-imperial-iv", name: "Imperial IV", releaseYear: "1961", notes: "Molded plastic cap/barrel、White Dot、14K inlaid nib；early Touchdown，later cartridge。", sourceKey: SOURCES.imperialEarly.key, variantKind: "variant" },
    { key: "phase106-imperial-vi", name: "Imperial VI", releaseYear: "1961", notes: "Polished stainless-steel cap、plastic barrel、14K inlaid nib；具体供墨按时期。", sourceKey: SOURCES.imperialEarly.key, variantKind: "variant" },
    { key: "phase106-imperial-viii", name: "Imperial VIII", releaseYear: "1961–1962 early line", notes: "Gold-filled cap 的高阶 early variant；尺寸、价格和尖宽不提升为 family default。", sourceKey: SOURCES.imperialEarly.key, variantKind: "variant" },
  ],
  spec: {
    brandEntityId: PHASE106_SHEAFFER_ID,
    values: {
      series_name: "Sheaffer Imperial family（Roman numeral 与后续阶段分开）",
      release_year: "1961 起；资料将 inlaid-nib Imperial 讨论延伸至约1998",
      origin_country: "Sheaffer USA 产品史语境；具体批次按刻印与目录核对",
      nib: "按子型变化；IV/VI/VIII 有 14K inlaid locator，其他 early/late 型可为不同尖型",
      fill_system: "Touchdown 与 cartridge/converter 版本并存；不是 PFM Snorkel",
      material: "IV plastic cap、VI stainless-steel cap、VIII gold-filled cap；不设全族统一帽材",
      dimensions: "early 识别指南的尺寸只绑定对应子型，不发布覆盖全族的统一数字",
      status: "历史家族；Dolphin、Triumph、Triumph Imperial 与相似笔逐身份核对",
    },
    evidence: [
      specEvidence("brand_entity_id", "phase106-imperial-brand", SOURCES.imperialEarly.key, imperialScope, "Sheaffer Imperial page title and 1961 dealer introduction"),
      specEvidence("series_name", "phase106-imperial-series", SOURCES.imperialEarly.key, imperialScope, "lines 89-118: Imperial line and naming changes"),
      specEvidence("release_year", "phase106-imperial-release", SOURCES.imperialInlaid.key, imperialScope, "lines 95-100: Imperial 1961-c1998 historical scope"),
      specEvidence("origin_country", "phase106-imperial-origin", SOURCES.imperialEarly.key, imperialScope, "early Sheaffer catalogue/advertising context; no factory inference beyond source"),
      specEvidence("nib", "phase106-imperial-nib", SOURCES.imperialEarly.key, imperialScope, "IV/VI/VIII identification guides; each row scoped independently"),
      specEvidence("fill_system", "phase106-imperial-fill", SOURCES.imperialInlaid.key, imperialScope, "lines 99-102: no Snorkel; Touchdown and cartridge/converter versions"),
      specEvidence("material", "phase106-imperial-material", SOURCES.imperialEarly.key, imperialScope, "IV, VI and VIII identification-guide cap/material rows"),
      specEvidence("dimensions", "phase106-imperial-dimensions", SOURCES.imperialEarly.key, imperialScope, "early identification-guide sample/model measurements remain variant-scoped"),
      specEvidence("status", "phase106-imperial-status", SOURCES.imperialInlaid.key, imperialScope, "historical 1961-c1998 discussion; revival names remain separate"),
    ],
  },
  media: primaryMedia("Imperial"),
  timeline: [
    { key: "phase106-imperial-1961", title: "早期 Imperial line", eventType: "model_released", startDate: "1961", circa: false, description: "IV 与 VI 在 1961 early line 中以不同帽材出现，家族从 Touchdown 很快扩展到 cartridge。", sourceKey: SOURCES.imperialEarly.key },
    { key: "phase106-imperial-lifetime", title: "Lifetime 命名阶段", eventType: "design_milestone", startDate: "1963", circa: false, description: "White Dot Imperial-style 型号曾进入 Lifetime 命名阶段；名称变化不等于统一规格。", sourceKey: SOURCES.imperialEarly.key },
  ],
};

const iconScope = "phase106-icon-9108-current";
export const phase106SheafferIconPack: CuratedEntityPack = {
  key: "phase106-sheaffer-icon-9108-v1",
  entityId: PHASE106_ICON_ID,
  expectedType: "pen",
  expectedSlug: PHASE106_ICON_SLUG,
  canonicalName: "Sheaffer Icon",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sheaffer-icon-phase106.md",
  storyTitle: "Sheaffer Icon：只把官方 9108 当前 SKU 写进规格",
  primarySourceKey: SOURCES.iconOfficial.key,
  depthTier: "A",
  aliases: [
    { alias: "Sheaffer Icon", language: "en", sourceKey: SOURCES.iconOfficial.key },
    { alias: "Sheaffer ICON 9108", language: "en", sourceKey: SOURCES.iconOfficial.key },
    { alias: "犀飞利 Icon", language: "zh", sourceKey: SOURCES.iconCollection.key },
  ],
  sources: [SOURCES.iconOfficial, SOURCES.iconCollection, SOURCES.iconReview, diagram],
  scopes: [
    {
      key: iconScope,
      scopeKey: iconScope,
      market: "Sheaffer.com current listing",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "9108 current page: Medium polished stainless-steel nib；flexible 仅保留营销原词，不推导 flex 等级。",
      materialScope: "9108 Matte Black with Gloss Black trim；不推广到 9110/9111 或 review sample。",
      editionScope: "唯一 approved market_sku 为 9108 fountain pen；merchant SKU E0910853/SH34234 仅作当前页面定位。",
    },
  ],
  claims: [
    {
      key: "phase106-icon-current-identity",
      predicate: "current_market_sku",
      objectText:
        "当前官方页面将 9108 定位为 Matte Black、Gloss Black trim 的 Medium Icon fountain pen，页面 merchant SKU 为 E0910853/SH34234。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: SOURCES.iconOfficial.key,
      locator: "lines 110-124",
      evidence: [
        { key: "phase106-icon-current-product", sourceKey: SOURCES.iconOfficial.key, scopeKey: iconScope, locator: "live lines 110-124: title, merchant SKU and Medium option" },
        { key: "phase106-icon-current-collection", sourceKey: SOURCES.iconCollection.key, scopeKey: iconScope, locator: "current official collection product-grid entry for 9108 fountain pen" },
      ],
    },
    {
      key: "phase106-icon-current-construction",
      predicate: "construction_and_box",
      objectText:
        "9108 官方页列出 polished stainless-steel nib、piston converter，以及蓝黑各一枚 Classic cartridge；Art Deco 与 wraparound clip 属于该页设计描述。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: SOURCES.iconOfficial.key,
      locator: "lines 193-209",
      evidence: [
        { key: "phase106-icon-official-construction", sourceKey: SOURCES.iconOfficial.key, scopeKey: iconScope, locator: "live lines 193-209: design, finish, tip and in-box sections" },
        { key: "phase106-icon-review-crosscheck", sourceKey: SOURCES.iconReview.key, scopeKey: iconScope, locator: "lines 908 and 912-917: distinct fine-nib review sample, steel nib, converter and cartridges; sample role only", note: "独立评测只交叉核对受测样本，不覆盖当前 9108 SKU。" },
      ],
    },
    {
      key: "phase106-icon-flex-boundary",
      predicate: "marketing_boundary",
      objectText:
        "官方 flexible nib 没有量化定义；本站只批准 stainless-steel 材质，不建立 flex 等级、线宽变化或全系写感结论。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: SOURCES.iconOfficial.key,
      locator: "line 205; no quantitative flex specification follows",
      evidence: [
        { key: "phase106-icon-flex-official", sourceKey: SOURCES.iconOfficial.key, scopeKey: iconScope, locator: "line 205: marketing phrase 'Flexible nib in polished stainless steel'; material retained, flex grade withheld" },
      ],
    },
  ],
  variants: [
    { key: "phase106-icon-9108", name: "Icon 9108 Matte Black fountain pen", releaseYear: "current listing verified 2026-07-21", notes: "Medium、Matte Black/Gloss Black trim、steel nib 与包装只绑定该官方页面。", sourceKey: SOURCES.iconOfficial.key, variantKind: "market_sku", productCode: "9108", market: "Sheaffer.com" },
  ],
  spec: {
    brandEntityId: PHASE106_SHEAFFER_ID,
    values: {
      series_name: "Sheaffer Icon — 9108 current fountain-pen scope",
      release_year: "当前官方 listing 于 2026-07-21 复核；不推断系列首发年",
      nib: "9108 Medium polished stainless-steel nib；不推导可量化 flex 等级",
      fill_system: "9108 随附 piston converter 与两枚 Classic cartridges（蓝、黑各一）",
      material: "9108 Matte Black with Gloss Black trim；其他颜色/SKU 未纳入",
      dimensions: "当前官方 9108 页面未在本包建立尺寸；评测样本不回填",
      status: "当前官方在售页面；market_sku=9108，复核日 2026-07-21",
    },
    evidence: [
      specEvidence("brand_entity_id", "phase106-icon-brand", SOURCES.iconOfficial.key, iconScope, "official Sheaffer product page and White Dot branding"),
      specEvidence("series_name", "phase106-icon-series", SOURCES.iconOfficial.key, iconScope, "live lines 110-114: Icon 9108 product title and merchant SKU"),
      specEvidence("release_year", "phase106-icon-release", SOURCES.iconCollection.key, iconScope, "current collection presence retrieved 2026-07-21; no launch-year inference"),
      specEvidence("nib", "phase106-icon-nib", SOURCES.iconOfficial.key, iconScope, "lines 203-206: Medium listing and polished stainless-steel nib; no quantified flex"),
      specEvidence("fill_system", "phase106-icon-fill", SOURCES.iconOfficial.key, iconScope, "lines 206-209: piston converter and two Classic cartridges"),
      specEvidence("material", "phase106-icon-material", SOURCES.iconOfficial.key, iconScope, "lines 199-205: 9108 finish and stainless-steel nib only"),
      specEvidence("dimensions", "phase106-icon-dimensions", SOURCES.iconOfficial.key, iconScope, "no current official dimensions in cited product sections; review sample not promoted"),
      specEvidence("status", "phase106-icon-status", SOURCES.iconCollection.key, iconScope, "current official collection entry retrieved 2026-07-21"),
    ],
  },
  media: primaryMedia("Icon 9108"),
  timeline: [
    { key: "phase106-icon-current-check", title: "Icon 9108 当前官方页复核", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "官方商品页与 collection 同日可访问；此日期是来源复核日，不冒充首发日。", sourceKey: SOURCES.iconOfficial.key },
  ],
};

export const phase106SheafferPacks: CuratedEntityPack[] = [
  phase106SheafferConnaisseurPack,
  phase106SheafferImperialPack,
  phase106SheafferIconPack,
];
