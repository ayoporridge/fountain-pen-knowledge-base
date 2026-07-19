import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

/** IDs checked against the 2026-07-19 checkpoint copy; none of these slugs existed there. */
export const PHASE56_SHEAFFER_ID = "tVXnzDSFCcPP";
export const PHASE56_RAW_CRAFTSMAN_ID = "qQbWP5zGOGSL";
export const PHASE56_RAW_TOUCHDOWN_TM_ID = "OxA3ZMr8ULNQ";
export const PHASE56_CRAFTSMAN_BALANCE_ID = "s56SHFCRBAL";
export const PHASE56_CRAFTSMAN_33T_ID = "s56SHFCR33T";
export const PHASE56_CRAFTSMAN_TIP_DIP_ID = "s56SHFCRTDTIP";
export const PHASE56_TOUCHDOWN_TM_ID = "s56SHFTDTM";

export const PHASE56_CRAFTSMAN_BALANCE_SLUG = "craftsman-balance";
export const PHASE56_CRAFTSMAN_33T_SLUG = "craftsman-33t-1949-lever";
export const PHASE56_CRAFTSMAN_TIP_DIP_SLUG = "craftsman-tip-dip-touchdown";
export const PHASE56_TOUCHDOWN_TM_SLUG = "touchdown-tm";
export const PHASE56_RAW_CRAFTSMAN_SLUG = "sheaffer-s-craftsman";
export const PHASE56_RAW_TOUCHDOWN_TM_SLUG = "sheaffer-s-touchdown-tm";

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
  balance: live({
    key: "phase56-sheaffer-balance",
    title: "Richard’s Pens: Sheaffer’s Balance",
    url: "https://www.richardspens.com/ref/profiles/balance.htm",
    registryKey: "richardspens-phase56-balance",
    registryName: "Richard’s Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "Balance 的流线外形、尺寸谱系和早期 Sheaffer 产品语境，用于 Craftsman (Balance) 的外形与年代边界。",
    locator: "Balance profile: streamlined shape, size families and filling variants",
  }),
  craftsman: live({
    key: "phase56-sheaffer-craftsman",
    title: "Richard’s Pens: Sheaffer’s Craftsman",
    url: "https://www.richardspens.com/ref/profiles/craftsman.htm",
    registryKey: "richardspens-phase56-craftsman",
    registryName: "Richard’s Pens",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary: "Craftsman 从 3-25、No. 3/33 尖到战后线环和 Tip-Dip 的命名与版本脉络；明确提醒相似线环笔不可统称 Craftsman。",
    locator: "Craftsman origin, No. 3/33 nib, Balance, postwar wire-ring, Touchdown and Tip-Dip sections",
  }),
  touchdownProfile: live({
    key: "phase56-sheaffer-touchdown-profile",
    title: "Richard’s Pens: Sheaffer’s Touchdown TM",
    url: "https://www.richardspens.com/ref/profiles/td_tm.htm",
    registryKey: "richardspens-phase56-touchdown-profile",
    registryName: "Richard’s Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "Touchdown TM 的 1949 fat → 1950 Thin Model → 1952 Snorkel 谱系、成员表、辨识点与配色边界。",
    locator: "TM chronology, family table, Snorkel comparison and color notes",
  }),
  snorkel: live({
    key: "phase56-sheaffer-snorkel",
    title: "Richard’s Pens: Sheaffer’s Snorkel",
    url: "https://www.richardspens.com/ref/profiles/snorkel.htm",
    registryKey: "richardspens-phase56-snorkel",
    registryName: "Richard’s Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "Snorkel 作为 Touchdown 后续技术的伸缩管与型号边界，供 TM 和 Tip-Dip 反向排除使用。",
    locator: "Snorkel profile: retractable tube and model-family distinction",
  }),
  pfm: live({
    key: "phase56-sheaffer-pfm",
    title: "Richard’s Pens: Sheaffer’s PFM",
    url: "https://www.richardspens.com/ref/profiles/pfm.htm",
    registryKey: "richardspens-phase56-pfm",
    registryName: "Richard’s Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "PFM 的大尺寸、Snorkel 和嵌入式尖作为另立型号页的排除边界，不把旗舰结构回填到 TM 或 Craftsman。",
    locator: "PFM profile: inlaid nib and Snorkel/PFM family context",
  }),
  penhero1948: live({
    key: "phase56-penhero-1948-taxonomy",
    title: "PenHero: Taxonomy of Late 1940s Sheaffer Models 1948–1949",
    url: "https://penhero.com/PenGallery/Sheaffer/SheafferTaxonomy1948_49.htm",
    registryKey: "penhero-phase56-taxonomy",
    registryName: "PenHero",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary: "1948 目录列出 Craftsman 33T、三种颜色、$3.50、gold-filled clip、1/32 cap band、14K No. 33 与 lever-fill only。",
    locator: "1948 catalog: Craftsman 33T row and 1949 Touchdown transition",
  }),
  penhero1949: live({
    key: "phase56-penhero-1949-taxonomy",
    title: "PenHero: Taxonomy of Late 1940s Sheaffer Models 1949–1950",
    url: "https://penhero.com/PenGallery/Sheaffer/SheafferTaxonomy1949_50.htm",
    registryKey: "penhero-phase56-taxonomy",
    registryName: "PenHero",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary: "1949–1950 目录与服务符号解释 Touchdown 的 S 后缀、颜色前缀和产品线换代背景。",
    locator: "1949 catalog and Sheaffer service-symbol suffixes",
  }),
  penheroTipDip: live({
    key: "phase56-penhero-tip-dip",
    title: "PenHero: Sheaffer Tip-Dip Touchdown Pens 1953–c1963",
    url: "https://penhero.com/PenGallery/Sheaffer/SheafferTipDip.htm",
    registryKey: "penhero-phase56-tip-dip",
    registryName: "PenHero",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary: "Tip-Dip Craftsman 的镀铬线纹帽、可换不锈钢尖、中心开口、颜色、尺寸与 1955 价格参考。",
    locator: "Craftsman/Cadet comparison, Tip-Dip opening, nib grades, dimensions and price",
  }),
  penheroTm: live({
    key: "phase56-penhero-tm",
    title: "PenHero: Sheaffer Thin Model Touchdown Pens 1950–1952",
    url: "https://penhero.com/PenGallery/Sheaffer/SheafferTMTouchdown.htm",
    registryKey: "penhero-phase56-tm",
    registryName: "PenHero",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary: "TM 的 1950–1952 年代、细身重设计、无 snorkel 的 Touchdown 机制和家族成员范围。",
    locator: "TM introduction and 1950–1952 profile",
  }),
  penheroTouchdownGuide: live({
    key: "phase56-penhero-touchdown-guide",
    title: "PenHero: Sheaffer Touchdown Filling System",
    url: "https://penhero.com/PenGallery/Sheaffer/SheafferTouchdownGuide.htm",
    registryKey: "penhero-phase56-touchdown-guide",
    registryName: "PenHero",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "Touchdown 从 1949 原始系列到 TM、Tip-Dip、Imperial 的持续使用及气压上墨步骤。",
    locator: "Touchdown chronology and filling instructions",
  }),
  vintageTouchdown: live({
    key: "phase56-vintagepens-touchdown-repair",
    title: "Vintage Pens: Sheaffer Touchdown Repair",
    url: "https://www.vintagepens.com/FAQrepair/Sheaffer_Touchdown_repair.shtml",
    registryKey: "vintagepens-phase56-touchdown-repair",
    registryName: "Vintage Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "Touchdown 墨囊、O-ring、柱塞与密封的维修边界，用于维护建议而非型号身份。",
    locator: "Touchdown repair: sac, O-ring, plunger and seal procedure",
  }),
  vintageSnorkel: live({
    key: "phase56-vintagepens-snorkel-pfm-repair",
    title: "Vintage Pens: Sheaffer Snorkel & PFM Repair",
    url: "https://vintagepens.com/FAQrepair/Sheaffer_Snorkel_PFM_repair.shtml",
    registryKey: "vintagepens-phase56-snorkel-repair",
    registryName: "Vintage Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "Snorkel/PFM 是 Touchdown 后续的复杂维修路径，作为不要跨页借用规格的对照。",
    locator: "Snorkel and PFM repair boundary",
  }),
  peytonIdentifier: live({
    key: "phase56-peyton-identifier",
    title: "Peyton Street Pens: Identifying Sheaffer Snorkel & TM Touchdown Models",
    url: "https://www.peytonstreetpens.com/resources/pen-resources/snorkel-touchdown-sheaffer",
    registryKey: "peytonstreet-phase56-identifier",
    registryName: "Peyton Street Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "识别树把 1940–50 年代 TM Touchdown 与 Snorkel 按尾部、握位和帽件逐步排除，明确不覆盖 lever/vac-fil。",
    locator: "decision tree scope and TM/Snorkel visual identifiers",
  }),
  peytonSentinel: live({
    key: "phase56-peyton-sentinel-tm",
    title: "Peyton Street Pens: Sentinel TM Touchdown reference",
    url: "https://www.peytonstreetpens.com/sheaffer-sentinel-tm-fountain-pen-touchdown-blue-medium-broad-very-nice-restored-personalized.html",
    registryKey: "peytonstreet-phase56-tm-sample",
    registryName: "Peyton Street Pens",
    sourceType: "retailer",
    tier: "retailer",
    summary: "Sentinel TM 个体档案给出 1950–52、约 5 5/16 英寸、无 snorkel、Touchdown、钢帽与修复状态，作为单样本而非全家族规格。",
    locator: "Sentinel TM product record: 1950–52, length and restored filler",
  }),
  balanceSvg: diagram("phase56-sheaffer-balance-svg", "Craftsman Balance factual map", "/images/library/site-original/sheaffer-p0/craftsman-balance.svg", "原创 factual SVG，区分 Balance-era Craftsman、价格线索和后期 Touchdown 分页。"),
  thirtyThreeSvg: diagram("phase56-sheaffer-33t-svg", "Craftsman 33T factual map", "/images/library/site-original/sheaffer-p0/craftsman-33t-1949-lever.svg", "原创 factual SVG，呈现 33T lever-fill、No. 33 尖和 1948 目录边界。"),
  tipDipSvg: diagram("phase56-sheaffer-tip-dip-svg", "Craftsman Tip-Dip factual map", "/images/library/site-original/sheaffer-p0/craftsman-tip-dip-touchdown.svg", "原创 factual SVG，呈现 Tip-Dip 中心开口、Touchdown 囊体和线纹帽。"),
  tmSvg: diagram("phase56-sheaffer-tm-svg", "Touchdown TM factual map", "/images/library/site-original/sheaffer-p0/touchdown-tm.svg", "原创 factual SVG，区分 1949 fat Touchdown、1950 TM 与 1952 Snorkel。"),
  brandSvg: diagram("phase56-sheaffer-brand-svg", "Sheaffer P0 identity map", "/images/library/site-original/sheaffer-p0/sheaffer-brand.svg", "原创 factual SVG，区分四个 P0 型号页和技术谱系。"),
} satisfies Record<string, CuratedSource>;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function makeBrandPack(): CuratedEntityPack {
  const scopeKey = "sheaffer-p0-brand-scope";
  const sources = [SOURCES.craftsman, SOURCES.touchdownProfile, SOURCES.snorkel, SOURCES.pfm, SOURCES.brandSvg];
  return {
    key: "phase56-sheaffer-brand-p0-v1",
    entityId: PHASE56_SHEAFFER_ID,
    expectedType: "brand",
    expectedSlug: "sheaffer",
    canonicalName: "犀飞利 Sheaffer",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/sheaffer-brand.md",
    storyTitle: "犀飞利 Sheaffer：从 Balance 到 Touchdown 的身份入口",
    primarySourceKey: SOURCES.craftsman.key,
    depthTier: "A",
    aliases: [
      { alias: "Sheaffer", language: "en", sourceKey: SOURCES.craftsman.key },
      { alias: "犀飞利", language: "zh", sourceKey: SOURCES.craftsman.key },
      { alias: "Sheaffer’s", language: "en", sourceKey: SOURCES.touchdownProfile.key },
    ],
    sources,
    scopes: [{ key: scopeKey, scopeKey, productionState: "historical", editionScope: "Sheaffer P0 identity map; model and mechanism facts remain on concrete pages" }],
    claims: [
      { key: "sheaffer-p0-brand-identity", predicate: "brand_identity", objectText: "Sheaffer 是美国书写工具品牌；本 P0 入口按型号与上墨技术分层，不把技术名当作单一型号。", factClass: "core", confidence: 0.98, sourceKey: SOURCES.craftsman.key, locator: "Craftsman/Balance and Touchdown profile context", evidence: [{ key: "sheaffer-p0-brand-identity-evidence", sourceKey: SOURCES.craftsman.key, scopeKey, locator: "brand and model-family context" }] },
      { key: "sheaffer-p0-technology-boundary", predicate: "technology_model_boundary", objectText: "Balance 是外形/产品语境，Touchdown 是气压上墨机制，Snorkel 是带伸缩管的后续机制，PFM 是另立的大尺寸型号家族。", factClass: "core", confidence: 0.99, sourceKey: SOURCES.touchdownProfile.key, locator: "TM, Snorkel and PFM comparison", evidence: [{ key: "sheaffer-p0-technology-boundary-evidence", sourceKey: SOURCES.touchdownProfile.key, scopeKey, locator: "family chronology and mechanism comparison" }, { key: "sheaffer-p0-snorkel-boundary-evidence", sourceKey: SOURCES.snorkel.key, scopeKey, locator: "Snorkel retractable tube boundary" }] },
    ],
    media: [{ key: "sheaffer-p0-brand-media", title: "Sheaffer P0 identity map（非产品照片）", sourceKey: SOURCES.brandSvg.key, localPath: SOURCES.brandSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影，不表现真实比例、颜色、Logo 或刻字。", sourceUrl: SOURCES.brandSvg.url, usageStatus: "primary" }],
    timeline: [
      { key: "sheaffer-p0-1949-touchdown", title: "Touchdown 气压上墨进入产品线", eventType: "design_milestone", startDate: "1949", circa: false, description: "PenHero 的晚 1940 年代目录整理把 1949 年作为 Touchdown 机制进入 Sheaffer 产品线的节点。", sourceKey: SOURCES.penhero1949.key },
      { key: "sheaffer-p0-1952-snorkel", title: "Snorkel 作为 Touchdown 后续机制", eventType: "design_milestone", startDate: "1952", circa: true, description: "Snorkel 在 Touchdown 之后增加伸缩吸墨管；本页把它留在另立技术与型号路径。", sourceKey: SOURCES.snorkel.key },
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
  extra: CuratedSource[];
  svg: CuratedSource;
  aliases: string[];
  releaseYear: string;
  originCountry: string;
  nib: string;
  fillSystem: string;
  material: string;
  dimensions: string;
  status: string;
  boundary: string;
  variantRows: Array<{ key: string; name: string; releaseYear: string; notes: string; sourceKey: string; variantKind?: "variant" | "edition_group" | "color" | "material" | "nib" | "market_sku" }>;
  identityLocator: string;
  careLocator: string;
}): CuratedEntityPack {
  const scopeKey = `${input.key}-scope`;
  const sources = [input.primary, ...input.extra, input.svg].filter((source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index);
  return {
    key: `phase56-${input.key}-v1`,
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
    aliases: input.aliases.map((alias, index) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: index === 0 ? input.primary.key : (input.extra[0]?.key ?? input.primary.key) })),
    sources,
    scopes: [{ key: scopeKey, scopeKey, productionState: "historical", editionScope: "具体 Sheaffer 型号身份；颜色、尖号、市场与维修状态按 variant 或实物记录" }],
    claims: [
      { key: `${input.key}-identity`, predicate: "model_identity", objectText: input.summary, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: input.identityLocator, evidence: [{ key: `${input.key}-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: input.identityLocator }] },
      { key: `${input.key}-boundary`, predicate: "version_boundary", objectText: input.boundary, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: input.identityLocator, evidence: [{ key: `${input.key}-boundary-evidence`, sourceKey: input.primary.key, scopeKey, locator: input.identityLocator }, { key: `${input.key}-tech-boundary-evidence`, sourceKey: SOURCES.touchdownProfile.key, scopeKey, locator: "technology/model distinction" }] },
      { key: `${input.key}-care`, predicate: "maintenance_boundary", objectText: "老 Sheaffer 先以室温清水吸排、观察气密或杠杆与墨囊状态；Touchdown 的 O-ring/墨囊、Tip-Dip 中心通道、Balance 的老材料与 Vacuum-Fil 组件必须按具体机制维修，禁止热水、酒精和暴力拆解。", factClass: "core", confidence: 0.97, sourceKey: SOURCES.vintageTouchdown.key, locator: input.careLocator, evidence: [{ key: `${input.key}-care-evidence`, sourceKey: SOURCES.vintageTouchdown.key, scopeKey, locator: input.careLocator }] },
    ],
    variants: input.variantRows.map((variant) => ({ ...variant, variantKind: variant.variantKind ?? "market_sku" })),
    spec: {
      brandEntityId: PHASE56_SHEAFFER_ID,
      values: { series_name: input.name, release_year: input.releaseYear, origin_country: input.originCountry, nib: input.nib, fill_system: input.fillSystem, material: input.material, dimensions: input.dimensions, status: input.status },
      evidence: [
        evidence("brand_entity_id", `${input.key}-brand`, input.primary.key, scopeKey, "Sheaffer maker identity"),
        evidence("series_name", `${input.key}-series`, input.primary.key, scopeKey, input.identityLocator),
        evidence("release_year", `${input.key}-release`, input.primary.key, scopeKey, "dated profile/catalog context"),
        evidence("origin_country", `${input.key}-origin`, input.primary.key, scopeKey, "Sheaffer USA product context"),
        evidence("nib", `${input.key}-nib`, input.primary.key, scopeKey, "nib structure or catalog row"),
        evidence("fill_system", `${input.key}-fill`, input.primary.key, scopeKey, "filling mechanism description"),
        evidence("material", `${input.key}-material`, input.extra[0]?.key ?? input.primary.key, scopeKey, "material/cap construction observation"),
        evidence("dimensions", `${input.key}-dimensions`, input.extra[0]?.key ?? input.primary.key, scopeKey, "measured sample or family reference"),
        evidence("status", `${input.key}-status`, input.primary.key, scopeKey, "historical production boundary"),
      ],
    },
    media: [{ key: `${input.key}-media`, title: `${input.name} factual SVG（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影，不表现真实比例、颜色、Logo 或刻字。", sourceUrl: input.svg.url, usageStatus: "primary" }],
    timeline: [{ key: `${input.key}-timeline`, title: `${input.name} 进入目录/资料`, eventType: "model_released", startDate: input.releaseYear.match(/\d{4}/)?.[0] ?? "1950", circa: true, description: input.summary, sourceKey: input.primary.key }],
  };
}

export const phase56SheafferPacks: CuratedEntityPack[] = [
  makeBrandPack(),
  makePen({
    key: "craftsman-balance", id: PHASE56_CRAFTSMAN_BALANCE_ID, slug: PHASE56_CRAFTSMAN_BALANCE_SLUG, name: "Sheaffer Craftsman (Balance)", title: "Sheaffer Craftsman (Balance)：3 号到 33 号尖的战前命名", summary: "Craftsman (Balance) 是 1930 年代中期至 1940 年代后期的 Balance-era 低价全尺寸命名，不把价格标记当作 model no。", markdownFile: ".planning/content-research/sheaffer-craftsman-balance.md", primary: SOURCES.craftsman, extra: [SOURCES.balance, SOURCES.penhero1948, SOURCES.vintageTouchdown, SOURCES.peytonIdentifier], svg: SOURCES.balanceSvg, aliases: ["Sheaffer Craftsman Balance", "Craftsman (Balance)", "犀飞利 Craftsman Balance", "Sheaffer Craftsman 战前款"], releaseYear: "约 1938–1947", originCountry: "美国（Sheaffer / Fort Madison 语境）", nib: "开放式 No. 3；约 1940 年前后可见 No. 33；线宽按具体尖与状态核对", fillSystem: "杠杆上墨或 Vacuum-Fil 变体；不并入 Touchdown", material: "赛璐珞/Radite 及后期材料，颜色和批次按实物核对", dimensions: "全尺寸 Balance 语境；没有一个覆盖全部样本的固定长度/重量", status: "历史型号；停产，具体样本需辨认", boundary: "本页只承载 Balance-era Craftsman；350/500/875/1000 等数字不是未经目录证明的 model no，33T、Tip-Dip 和 TM 另立。", variantRows: [{ key: "craftsman-balance-no3", name: "Balance Craftsman No. 3 nib", releaseYear: "约 1938–1939", notes: "早期 Craftsman 线索：No. 3 开放式尖、Balance 轮廓；颜色和上墨按样本。", sourceKey: SOURCES.craftsman.key }, { key: "craftsman-balance-no33", name: "Balance Craftsman No. 33 nib", releaseYear: "约 1940–1947", notes: "后期可见 No. 33 开放式尖；不能据此直接改称 33T。", sourceKey: SOURCES.craftsman.key }], identityLocator: "Craftsman origin, No. 3/33 nib and Balance-era naming", careLocator: "Touchdown repair is not a substitute for lever/Vacuum-Fil repair; old material and filling boundary" }),
  makePen({
    key: "craftsman-33t", id: PHASE56_CRAFTSMAN_33T_ID, slug: PHASE56_CRAFTSMAN_33T_SLUG, name: "Sheaffer Craftsman 33T (1949 Lever)", title: "Sheaffer Craftsman 33T (1949 Lever)：目录符号里的明确身份", summary: "Craftsman 33T 是 1948 目录已列出的开放式 14K No. 33 杠杆笔，T 表示 lever-fill；它属于 Touchdown 之前的具体过渡身份。", markdownFile: ".planning/content-research/sheaffer-craftsman-33t-1949-lever.md", primary: SOURCES.penhero1948, extra: [SOURCES.penhero1949, SOURCES.craftsman, SOURCES.balance, SOURCES.vintageTouchdown], svg: SOURCES.thirtyThreeSvg, aliases: ["Craftsman 33T", "Sheaffer 33T", "犀飞利 Craftsman 33T", "Craftsman 1949 lever"], releaseYear: "1948 目录；1949 Touchdown 换代节点", originCountry: "美国（Sheaffer / Fort Madison 语境）", nib: "开放式 14K No. 33；线宽与尖状态按具体样本核对", fillSystem: "lever-fill only（33T 的 T 后缀）", material: "黑色、Burnt Umber Brown、Persian Blue；gold-filled clip 与 1/32-inch cap band 见 1948 目录", dimensions: "目录未提供可覆盖所有样本的稳定长度；个体按实物测量", status: "历史型号；1948 目录身份，随后被 Touchdown 体系分流", boundary: "本页只承载 1948 目录的 Craftsman 33T lever；它不是 Balance 页的所有 No. 33，也不是 Touchdown/TM/Tip-Dip。", variantRows: [{ key: "craftsman-33t-1948-catalog", name: "Craftsman 33T 1948 catalog", releaseYear: "1948", notes: "$3.50；Black/Burnt Umber Brown/Persian Blue；gold-filled Sheaffer’s clip、1/32 cap band、14K No. 33、lever-fill only。", sourceKey: SOURCES.penhero1948.key }], identityLocator: "1948 catalog row: Craftsman 33T, $3.50 and lever-fill only", careLocator: "Lever-fill sac and section repair boundary; do not apply Touchdown O-ring procedure" }),
  makePen({
    key: "craftsman-tip-dip", id: PHASE56_CRAFTSMAN_TIP_DIP_ID, slug: PHASE56_CRAFTSMAN_TIP_DIP_SLUG, name: "Sheaffer Craftsman Tip-Dip Touchdown", title: "Sheaffer Craftsman Tip-Dip Touchdown：低价线里的可换尖气压笔", summary: "Tip-Dip Craftsman 是 1952 年后保留 Touchdown 囊体、以中心开口和可换不锈钢尖实现“只浸尖端”上墨的低价型号，不是 Snorkel。", markdownFile: ".planning/content-research/sheaffer-craftsman-tip-dip-touchdown.md", primary: SOURCES.penheroTipDip, extra: [SOURCES.penheroTouchdownGuide, SOURCES.craftsman, SOURCES.snorkel, SOURCES.vintageTouchdown, SOURCES.peytonIdentifier], svg: SOURCES.tipDipSvg, aliases: ["Sheaffer Tip-Dip Craftsman", "Craftsman Tip-Dip", "犀飞利 Tip-Dip Craftsman", "Craftsman Touchdown 1950s"], releaseYear: "约 1952–1960s", originCountry: "美国（Sheaffer / Fort Madison 语境）", nib: "可换开放式不锈钢 Tip-Dip 尖；EF、shorthand、F、M、B、stub 等历史等级线索", fillSystem: "Touchdown 气压囊；Tip-Dip 中心开口引导墨水", material: "纯色注塑塑料笔杆；镀铬线纹金属帽；颜色和批次按实物核对", dimensions: "约 5 1/8 英寸闭帽、5 7/8 英寸加帽（PenHero 参考样本）", status: "历史型号；Tip-Dip 低价 Touchdown 线，具体年份/市场需核对", boundary: "本页只指 Craftsman Tip-Dip Touchdown；无 Snorkel 伸缩管；Cadet、TM、Balance 和 PFM 另立。", variantRows: [{ key: "craftsman-tip-dip-chrome", name: "Craftsman Tip-Dip chrome-cap", releaseYear: "约 1953–1960s", notes: "镀铬帽宽间距线纹、纯色塑料笔杆、SHEAFFER’S 夹子和可换不锈钢 Tip-Dip 尖。", sourceKey: SOURCES.penheroTipDip.key }, { key: "craftsman-tip-dip-colors", name: "Craftsman Tip-Dip color group", releaseYear: "约 1953–1960s", notes: "黑、酒红、淡彩绿、淡蓝、灰等资料颜色；颜色不是独立型号。", sourceKey: SOURCES.penheroTipDip.key }], identityLocator: "Tip-Dip Craftsman/Cadet comparison and identification features", careLocator: "Touchdown sac and O-ring repair plus Tip-Dip center-channel cleaning" }),
  makePen({
    key: "touchdown-tm", id: PHASE56_TOUCHDOWN_TM_ID, slug: PHASE56_TOUCHDOWN_TM_SLUG, name: "Sheaffer Touchdown TM", title: "Sheaffer Touchdown TM：Snorkel 之前的 Thin Model 家族", summary: "Touchdown TM 是 1950–1952 年的细身气压上墨家族；它没有 Snorkel 伸缩管，TM 是轮廓/产品线边界，不是单一 model no。", markdownFile: ".planning/content-research/sheaffer-touchdown-tm.md", primary: SOURCES.penheroTm, extra: [SOURCES.touchdownProfile, SOURCES.penheroTouchdownGuide, SOURCES.penhero1949, SOURCES.snorkel, SOURCES.pfm, SOURCES.vintageTouchdown, SOURCES.vintageSnorkel, SOURCES.peytonIdentifier, SOURCES.peytonSentinel], svg: SOURCES.tmSvg, aliases: ["Sheaffer TM Touchdown", "Touchdown Thin Model", "犀飞利 Touchdown TM", "Sheaffer Thin Model"], releaseYear: "1950–1952", originCountry: "美国（Sheaffer / Fort Madison 语境）", nib: "成员依配置而异：Triumph 双色 14K、No. 5 开放式尖及其他具体尖号；不可家族统称", fillSystem: "Touchdown pneumatic filler；无 Snorkel 伸缩管", material: "Forticel/Radite II 注塑塑料、透明握位环，成员可配不锈钢/包金/贵金属帽", dimensions: "TM 家族为细身轮廓；Sentinel TM 参考样本约 5 5/16 英寸闭帽，非全家族固定值", status: "历史产品家族；1952 年后多数产品线转向 Snorkel，成员和市场版本需核对", boundary: "本页是 TM family 入口，不把 Sentinel/Valiant/Craftsman 的具体尖、帽和价格互填；有 snorkel 管则进入 Snorkel 页，PFM 另立。", variantRows: [{ key: "touchdown-tm-sentinel", name: "Sentinel TM", releaseYear: "1950–1952", notes: "无 snorkel 的细身 Touchdown，常见钢帽；Peyton Street 单样本约 5 5/16 英寸闭帽。", sourceKey: SOURCES.peytonSentinel.key }, { key: "touchdown-tm-valiant", name: "Valiant TM", releaseYear: "约 1950–1952", notes: "TM 家族成员；帽、笔环和尖配置不能从 Sentinel 样本推断。", sourceKey: SOURCES.touchdownProfile.key }, { key: "touchdown-tm-craftsman", name: "Craftsman TM family member", releaseYear: "约 1950–1952", notes: "Touchdown TM 表中线环、较粗短的入门成员；Tip-Dip Craftsman 是后续另立页。", sourceKey: SOURCES.touchdownProfile.key }], identityLocator: "TM introduction, 1950–1952 family boundary and no-snorkel distinction", careLocator: "Touchdown sac/O-ring repair; Snorkel/PFM parts and procedures intentionally excluded" }),
];

export const phase56SheafferRetire = {
  craftsman: { sourceEntityId: PHASE56_RAW_CRAFTSMAN_ID, sourceSlug: PHASE56_RAW_CRAFTSMAN_SLUG, targetIds: [PHASE56_CRAFTSMAN_BALANCE_ID, PHASE56_CRAFTSMAN_33T_ID, PHASE56_CRAFTSMAN_TIP_DIP_ID] },
  touchdownTm: { sourceEntityId: PHASE56_RAW_TOUCHDOWN_TM_ID, sourceSlug: PHASE56_RAW_TOUCHDOWN_TM_SLUG, targetId: PHASE56_TOUCHDOWN_TM_ID },
};
