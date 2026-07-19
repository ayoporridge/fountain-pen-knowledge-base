import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

/** IDs recovered from the committed Phase 19 disposable audit snapshot, not invented. */
export const PHASE62_SHEAFFER_ID = "tVXnzDSFCcPP";
export const PHASE62_BALANCE_ID = "usCp8x8GbG-9";
export const PHASE62_SNORKEL_ID = "pcft_zIm9kP9";
export const PHASE62_PFM_ID = "DfCvXoVXPG_n";
export const PHASE62_TUCKAWAY_ID = "qVrtyA8zR6wk";
export const PHASE62_TARGA_ID = "RmxZTCu-XMdN";
export const PHASE62_MIXED_IMPERIAL_ID = "5JqrNzxFsWC6";

export const PHASE62_BALANCE_RAW_SLUG = "sheaffer-s-balance";
export const PHASE62_SNORKEL_RAW_SLUG = "sheaffer-s-snorkel";
export const PHASE62_PFM_RAW_SLUG = "sheaffer-s-pfm";
export const PHASE62_TUCKAWAY_RAW_SLUG = "sheaffer-s-tuckaway";
export const PHASE62_TARGA_RAW_SLUG = "targa-by-sheaffer";
export const PHASE62_MIXED_IMPERIAL_SLUG = "犀飞利-sheaffer-帝国元首";

export const PHASE62_BALANCE_SLUG = "sheaffer-balance";
export const PHASE62_SNORKEL_SLUG = "sheaffer-snorkel";
export const PHASE62_PFM_SLUG = "sheaffer-pfm";
export const PHASE62_TUCKAWAY_SLUG = "sheaffer-tuckaway";
export const PHASE62_TARGA_SLUG = "sheaffer-targa";

const RETRIEVED = "2026-07-20";

function live(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "homepageUrl" | "archiveUrl" | "archiveLocator" | "independenceGroup">): CuratedSource {
  return { ...input, homepageUrl: input.url, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`, independenceGroup: input.registryKey };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG，示意图而非产品照片。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;to-scale=false` };
}

const SOURCES = {
  balance: live({ key: "phase62-richards-balance", registryKey: "richardspens-phase62-balance", registryName: "Richard’s Pens", sourceType: "blog", tier: "professional_secondary", title: "Richard’s Pens: Sheaffer’s Balance", url: "https://www.richardspens.com/ref/profiles/balance.htm", summary: "Balance 的流线外形、尺寸谱系、等级和填充变体。" }),
  snorkel: live({ key: "phase62-penhero-snorkel", registryKey: "penhero-phase62-snorkel", registryName: "PenHero", sourceType: "blog", tier: "contemporary_archive", title: "PenHero: The Snorkel", url: "https://www.penhero.com/PenGallery/Sheaffer/SheafferSnorkelGuide.htm", summary: "Snorkel 的伸缩管、Touchdown 工程、成员和年代边界。" }),
  snorkelProfile: live({ key: "phase62-richards-snorkel", registryKey: "richardspens-phase62-snorkel", registryName: "Richard’s Pens", sourceType: "blog", tier: "professional_secondary", title: "Richard’s Pens: Sheaffer’s Snorkel", url: "https://www.richardspens.com/ref/profiles/snorkel.htm", summary: "Snorkel 家族的实物与成员识别语境。" }),
  pfm: live({ key: "phase62-penhero-pfm", registryKey: "penhero-phase62-pfm", registryName: "PenHero", sourceType: "blog", tier: "contemporary_archive", title: "PenHero: Sheaffer PFM 1959–1968", url: "https://www.penhero.com/PenGallery/Sheaffer/SheafferPFM.htm", summary: "PFM I–V、PdAg/14K 嵌入尖、Snorkel 和年代。" }),
  pfmProfile: live({ key: "phase62-richards-pfm", registryKey: "richardspens-phase62-pfm", registryName: "Richard’s Pens", sourceType: "blog", tier: "professional_secondary", title: "Richard’s Pens: Sheaffer’s PFM", url: "https://www.richardspens.com/ref/profiles/pfm.htm", summary: "PFM 的大尺寸与家族 profile。" }),
  tuckaway: live({ key: "phase62-richards-tuckaway", registryKey: "richardspens-phase62-tuckaway", registryName: "Richard’s Pens", sourceType: "blog", tier: "professional_secondary", title: "Richard’s Pens: Sheaffer’s Tuckaway", url: "https://www.richardspens.com/ref/profiles/tuckaway.htm", summary: "Tuckaway 的短身、年代和 lever/Vacuum-Fil/Triumph/Touchdown 阶段。" }),
  chronology: live({ key: "phase62-penhero-penography", registryKey: "penhero-phase62-penography", registryName: "PenHero", sourceType: "blog", tier: "contemporary_archive", title: "PenHero: Sheaffer Penography", url: "https://www.penhero.com/PenGallery/Sheaffer/Sheaffer.htm", summary: "Sheaffer 型号年表与相邻产品线定位。" }),
  targa: live({ key: "phase62-richards-targa", registryKey: "richardspens-phase62-targa", registryName: "Richard’s Pens", sourceType: "blog", tier: "professional_secondary", title: "Richard’s Pens: Targa by Sheaffer", url: "https://www.richardspens.com/ref/profiles/targa.htm", summary: "Targa 标准、Slim、饰面与笔尖的家族资料。" }),
  inlaid: live({ key: "phase62-penhero-inlaid", registryKey: "penhero-phase62-inlaid", registryName: "PenHero", sourceType: "blog", tier: "contemporary_archive", title: "PenHero: Evolution of the Sheaffer Inlaid Nib", url: "https://www.penhero.com/PenGallery/Sheaffer/SheafferInlaidNibs.htm", summary: "PFM、Imperial、Targa、Legacy 的嵌入尖谱系边界。" }),
  repair: live({ key: "phase62-vintagepens-snorkel-pfm", registryKey: "vintagepens-phase62-snorkel", registryName: "Vintage Pens", sourceType: "blog", tier: "professional_secondary", title: "Vintage Pens: Sheaffer Snorkel & PFM Repair", url: "https://www.vintagepens.com/FAQrepair/Sheaffer_Snorkel_PFM_repair.shtml", summary: "Snorkel/PFM 的墨囊、O-ring、密封与修复边界。" }),
  brandSvg: diagram("phase62-sheaffer-brand-svg", "Sheaffer brand family map", "/images/library/site-original/sheaffer-p0/sheaffer-brand.svg"),
  balanceSvg: diagram("phase62-balance-svg", "Sheaffer Balance family map", "/images/library/site-original/sheaffer-p0-wave2/balance.svg"),
  snorkelSvg: diagram("phase62-snorkel-svg", "Sheaffer Snorkel mechanism map", "/images/library/site-original/sheaffer-p0-wave2/snorkel.svg"),
  pfmSvg: diagram("phase62-pfm-svg", "Sheaffer PFM I–V boundary map", "/images/library/site-original/sheaffer-p0-wave2/pfm.svg"),
  tuckawaySvg: diagram("phase62-tuckaway-svg", "Sheaffer Tuckaway family map", "/images/library/site-original/sheaffer-p0-wave2/tuckaway.svg"),
  targaSvg: diagram("phase62-targa-svg", "Sheaffer Targa family map", "/images/library/site-original/sheaffer-p0-wave2/targa.svg"),
};

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator };
}

type PenInput = { key: string; id: string; slug: string; name: string; title: string; summary: string; markdownFile: string; primary: CuratedSource; extra: CuratedSource[]; svg: CuratedSource; aliases: string[]; releaseYear: string; nib: string; fillSystem: string; material: string; dimensions: string; status: string; boundary: string; variants: Array<{ key: string; name: string; releaseYear: string; notes: string; sourceKey: string; variantKind?: "variant" | "edition_group" | "material" }>; };

function pen(input: PenInput): CuratedEntityPack {
  const scopeKey = `${input.key}-scope`;
  const sources = [input.primary, ...input.extra, SOURCES.repair, input.svg].filter((item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index);
  const second = input.extra[0] ?? input.primary;
  return {
    key: `phase62-${input.key}-v1`, entityId: input.id, expectedType: "pen", expectedSlug: input.slug, canonicalName: input.name, publicationIntent: "publish", publicationBlockers: [], markdownFile: input.markdownFile, storyTitle: input.title, primarySourceKey: input.primary.key, depthTier: "A",
    aliases: input.aliases.map((alias, index) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: index === 0 ? input.primary.key : second.key })), sources,
    scopes: [{ key: scopeKey, scopeKey, productionState: "historical", editionScope: "型号家族页；具体子型的尖、填充、材料与尺寸按其目录或实物证据分别判断" }],
    claims: [
      { key: `${input.key}-identity`, predicate: "model_identity", objectText: input.summary, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: input.primary.summary, evidence: [{ key: `${input.key}-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: input.primary.summary }] },
      { key: `${input.key}-boundary`, predicate: "version_boundary", objectText: input.boundary, factClass: "core", confidence: 0.99, sourceKey: second.key, locator: second.summary, evidence: [{ key: `${input.key}-boundary-evidence`, sourceKey: second.key, scopeKey, locator: second.summary }] },
      { key: `${input.key}-care`, predicate: "maintenance_boundary", objectText: "老 Sheaffer 的上墨机构、密封、尖和材料先按具体版本检查；不以热水、强溶剂或蛮力拆解替代专业维修。", factClass: "core", confidence: 0.96, sourceKey: SOURCES.repair.key, locator: SOURCES.repair.summary, evidence: [{ key: `${input.key}-care-evidence`, sourceKey: SOURCES.repair.key, scopeKey, locator: SOURCES.repair.summary }] },
    ],
    variants: input.variants,
    spec: { brandEntityId: PHASE62_SHEAFFER_ID, values: { series_name: input.name, release_year: input.releaseYear, origin_country: "美国（Sheaffer / Fort Madison 产品史语境）", nib: input.nib, fill_system: input.fillSystem, material: input.material, dimensions: input.dimensions, status: input.status }, evidence: [
      evidence("brand_entity_id", `${input.key}-brand`, input.primary.key, scopeKey, "Sheaffer maker identity"), evidence("series_name", `${input.key}-series`, input.primary.key, scopeKey, input.primary.summary), evidence("release_year", `${input.key}-release`, input.primary.key, scopeKey, input.primary.summary), evidence("origin_country", `${input.key}-origin`, input.primary.key, scopeKey, "Sheaffer USA product history"), evidence("nib", `${input.key}-nib`, input.primary.key, scopeKey, input.primary.summary), evidence("fill_system", `${input.key}-fill`, input.primary.key, scopeKey, input.primary.summary), evidence("material", `${input.key}-material`, second.key, scopeKey, second.summary), evidence("dimensions", `${input.key}-dimensions`, second.key, scopeKey, "family-level dimensions only; individual samples vary"), evidence("status", `${input.key}-status`, input.primary.key, scopeKey, input.primary.summary),
    ] },
    media: [{ key: `${input.key}-media`, title: `${input.name} factual SVG（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制产品摄影，不代表真实比例、颜色、Logo、刻字或具体 SKU。", sourceUrl: input.svg.url, usageStatus: "primary" }],
    timeline: [{ key: `${input.key}-timeline`, title: `${input.name} 的目录/产品线节点`, eventType: "model_released", startDate: input.releaseYear.match(/\d{4}/)?.[0] ?? "1950", circa: true, description: input.summary, sourceKey: input.primary.key }],
  };
}

function brandPack(): CuratedEntityPack {
  const scopeKey = "phase62-sheaffer-brand-scope";
  return {
    key: "phase62-sheaffer-brand-v1",
    entityId: PHASE62_SHEAFFER_ID,
    expectedType: "brand",
    expectedSlug: "sheaffer",
    canonicalName: "犀飞利 Sheaffer",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/sheaffer-brand.md",
    storyTitle: "犀飞利 Sheaffer：从 Balance 到 Targa 的型号与机制导航",
    primarySourceKey: SOURCES.balance.key,
    depthTier: "A",
    aliases: [
      { alias: "Sheaffer", language: "en", sourceKey: SOURCES.balance.key },
      { alias: "犀飞利", language: "zh", sourceKey: SOURCES.balance.key },
    ],
    sources: [SOURCES.balance, SOURCES.chronology, SOURCES.targa, SOURCES.repair, SOURCES.brandSvg],
    scopes: [{ key: scopeKey, scopeKey, productionState: "historical", editionScope: "品牌与型号家族导航；具体尖、上墨、材料按子型页面核对" }],
    claims: [
      { key: "phase62-sheaffer-brand-identity", predicate: "brand_identity", objectText: "Sheaffer 是美国书写工具品牌；品牌页按具体型号家族和上墨机制导航，不把 Balance、Touchdown 或嵌入尖当作单一型号。", factClass: "core", confidence: 0.98, sourceKey: SOURCES.balance.key, locator: SOURCES.balance.summary, evidence: [{ key: "phase62-sheaffer-brand-identity-evidence", sourceKey: SOURCES.balance.key, scopeKey, locator: SOURCES.balance.summary }] },
      { key: "phase62-sheaffer-brand-boundary", predicate: "model_family_boundary", objectText: "Balance、Snorkel、PFM、Tuckaway 与 Targa 是跨年代的不同家族；结构、笔尖和维修方法不能从名称相近或外观相似推断。", factClass: "core", confidence: 0.98, sourceKey: SOURCES.chronology.key, locator: SOURCES.chronology.summary, evidence: [{ key: "phase62-sheaffer-brand-boundary-evidence", sourceKey: SOURCES.chronology.key, scopeKey, locator: SOURCES.chronology.summary }] },
    ],
    timeline: [
      { key: "phase62-sheaffer-balance", title: "Balance 流线型家族", eventType: "design_milestone", startDate: "1929", circa: false, description: "Balance 建立了可跨尺寸、笔尖和上墨版本的流线型产品家族。", sourceKey: SOURCES.balance.key },
      { key: "phase62-sheaffer-targa", title: "Targa 嵌入尖家族", eventType: "design_milestone", startDate: "1976", circa: false, description: "Targa 延续嵌入尖谱系，但不与 Imperial 或 Legacy 自动合并。", sourceKey: SOURCES.targa.key },
    ],
    media: [{ key: "phase62-sheaffer-brand-media", title: "Sheaffer 品牌家族事实图（非产品照片）", sourceKey: SOURCES.brandSvg.key, localPath: SOURCES.brandSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片。", sourceUrl: SOURCES.brandSvg.url, usageStatus: "primary" }],
  };
}

export const phase62SheafferPacks: CuratedEntityPack[] = [
  brandPack(),
  pen({ key: "balance", id: PHASE62_BALANCE_ID, slug: PHASE62_BALANCE_SLUG, name: "Sheaffer Balance", title: "Sheaffer Balance：把流线外形当作家族，不当作一支固定笔", summary: "Sheaffer Balance 是 1929 年开始出现的流线型产品家族；它跨越尺寸、笔尖和上墨配置，不能被写成单一 SKU，也不是 Craftsman 的同义词。", markdownFile: ".planning/content-research/sheaffer-balance.md", primary: SOURCES.balance, extra: [SOURCES.chronology], svg: SOURCES.balanceSvg, aliases: ["Sheaffer Balance", "Sheaffer’s Balance", "犀飞利 Balance", "犀飞利 平衡"], releaseYear: "1929–约1941（家族阶段）", nib: "按子型变化；开放式尖、White Dot 与材质不能家族统称", fillSystem: "lever-fill、Vacuum-Fil 等版本并存；按具体笔判断", material: "赛璐珞及同时代材料；帽、饰件和颜色按版本", dimensions: "尺寸谱系并存；无覆盖全族的固定长度/重量", status: "历史产品家族；停产", boundary: "Balance 是流线外形与产品家族；Craftsman、33T、Tip-Dip 与 Touchdown TM 是独立身份。", variants: [{ key: "balance-senior", name: "Balance Senior / Lifetime route", releaseYear: "1930s", notes: "尺寸与等级路线，需以具体目录确认材料、笔尖与上墨。", sourceKey: SOURCES.balance.key, variantKind: "variant" }, { key: "balance-craftsman", name: "Balance-era Craftsman", releaseYear: "1930s–1940s", notes: "低价线的相邻独立节点，不等于整条 Balance。", sourceKey: SOURCES.balance.key, variantKind: "variant" }] }),
  pen({ key: "snorkel", id: PHASE62_SNORKEL_ID, slug: PHASE62_SNORKEL_SLUG, name: "Sheaffer Snorkel", title: "Sheaffer Snorkel：一套带伸缩吸墨管的产品家族", summary: "Sheaffer Snorkel 是约 1952–1959 年的产品家族：它以 Touchdown 气压结构配合伸缩吸墨管，成员的笔尖、帽材与等级并不相同。", markdownFile: ".planning/content-research/sheaffer-snorkel.md", primary: SOURCES.snorkel, extra: [SOURCES.snorkelProfile, SOURCES.repair], svg: SOURCES.snorkelSvg, aliases: ["Sheaffer Snorkel", "Sheaffer’s Snorkel", "犀飞利 Snorkel", "犀飞利 潜艇"], releaseYear: "约1952–1959", nib: "按成员变化：Triumph 与开放式尖均可见，材质按子型确认", fillSystem: "Touchdown 气压囊 + 伸缩 Snorkel 吸墨管", material: "帽材、笔杆、trim 依成员而变", dimensions: "家族尺寸多样；不得以单样本作统一规格", status: "历史产品家族；停产", boundary: "Snorkel 是家族，不等于每个成员均为 Triumph 14K；PFM 是相邻但独立的旗舰家族。", variants: [{ key: "snorkel-admiral", name: "Snorkel Admiral", releaseYear: "1950s", notes: "常见家族成员；以目录确认尖、帽与 trim。", sourceKey: SOURCES.snorkelProfile.key, variantKind: "variant" }, { key: "snorkel-crest", name: "Snorkel Crest / Statesman route", releaseYear: "1950s", notes: "高阶成员的帽与尖配置不能回填全系。", sourceKey: SOURCES.snorkelProfile.key, variantKind: "variant" }] }),
  pen({ key: "pfm", id: PHASE62_PFM_ID, slug: PHASE62_PFM_SLUG, name: "Sheaffer PFM", title: "Sheaffer PFM：Snorkel 时代的旗舰嵌入尖家族", summary: "PFM（Pen For Men）是 1959–1968 年的 Sheaffer 旗舰家族，以 Snorkel 结构和嵌入式笔尖著称；PFM I/II 的钯银尖与 III–V 的 14K 尖必须分开。", markdownFile: ".planning/content-research/sheaffer-pfm.md", primary: SOURCES.pfm, extra: [SOURCES.pfmProfile, SOURCES.repair, SOURCES.inlaid], svg: SOURCES.pfmSvg, aliases: ["Sheaffer PFM", "Pen For Men", "犀飞利 PFM", "犀飞利 Pen For Men"], releaseYear: "1959–1968", nib: "PFM I/II：palladium-silver inlaid nib；III/IV/V：14K inlaid nib", fillSystem: "Snorkel 填充结构；不是 Legacy 的 modified Touchdown", material: "帽、笔杆、trim 按 I–V 与具体版本变化", dimensions: "约5 3/8英寸闭帽、5 3/4英寸加帽为对比样本参考，非全族固定值", status: "历史旗舰家族；停产", boundary: "PFM 不是普通 Snorkel 的通用变体；不得与 Imperial、Targa、Legacy 互填上墨和笔尖规格。", variants: [{ key: "pfm-i-ii", name: "PFM I / II", releaseYear: "1959–1960s", notes: "钯银嵌入尖；PFM I 无 White Dot。", sourceKey: SOURCES.pfm.key, variantKind: "variant" }, { key: "pfm-iii-v", name: "PFM III / IV / V", releaseYear: "1959–1968", notes: "14K 嵌入尖；Autograph 和 demonstrator 属于特定 sibling。", sourceKey: SOURCES.pfm.key, variantKind: "variant" }] }),
  pen({ key: "tuckaway", id: PHASE62_TUCKAWAY_ID, slug: PHASE62_TUCKAWAY_SLUG, name: "Sheaffer Tuckaway", title: "Sheaffer Tuckaway：短身、可加帽书写的便携家族", summary: "Sheaffer Tuckaway 是约 1940 至 1950 年前后的短身便携家族；它跨越杠杆、Vacuum-Fil、Triumph 与 Touchdown 阶段，不能因“短”就混作一型。", markdownFile: ".planning/content-research/sheaffer-tuckaway.md", primary: SOURCES.tuckaway, extra: [SOURCES.chronology], svg: SOURCES.tuckawaySvg, aliases: ["Sheaffer Tuckaway", "Sheaffer’s Tuckaway", "犀飞利 Tuckaway", "犀飞利 便携短笔"], releaseYear: "约1940–1950", nib: "开放式与 Triumph 等按年代/版本确认", fillSystem: "lever-fill、Vacuum-Fil、后期 Touchdown 等阶段并存", material: "短身笔杆与帽材按版本变化", dimensions: "短身、通常加帽书写；无统一固定长度", status: "历史产品家族；停产", boundary: "短身不等于同一版本；Tuckaway 的不同上墨与尖型不共用维修方法，也不能直接归作 Balance 或 Snorkel。", variants: [{ key: "tuckaway-lever-vacuum", name: "Lever / Vacuum-Fil stages", releaseYear: "约1940–1941", notes: "早期短身阶段；填充方式须按实物分别确认。", sourceKey: SOURCES.tuckaway.key, variantKind: "variant" }, { key: "tuckaway-triumph-touchdown", name: "Triumph / Touchdown stages", releaseYear: "约1942–1950", notes: "重设计与后期工程语境，不能回填早期杠杆版本。", sourceKey: SOURCES.tuckaway.key, variantKind: "variant" }] }),
  pen({ key: "targa", id: PHASE62_TARGA_ID, slug: PHASE62_TARGA_SLUG, name: "Sheaffer Targa", title: "Sheaffer Targa：1976 年后长期延续的嵌入尖家族", summary: "Sheaffer Targa 是 1976 年推出、延续至约 1998 年的嵌入式笔尖家族；标准、全不锈钢、Slim 与特别版必须分别记录，不能写成 Imperial 或 Legacy。", markdownFile: ".planning/content-research/sheaffer-targa.md", primary: SOURCES.targa, extra: [SOURCES.inlaid, SOURCES.chronology], svg: SOURCES.targaSvg, aliases: ["Sheaffer Targa", "Targa by Sheaffer", "犀飞利 Targa", "犀飞利 达加"], releaseYear: "1976–约1998", nib: "多数版本为14K 嵌入尖；全不锈钢低价款可为 steel nib", fillSystem: "cartridge/converter 语境按具体版本与市场核对", material: "标准、全不锈钢、Slim、饰面与特别版分开记录", dimensions: "标准与 Slim 为不同尺寸路线；具体长度按版本", status: "历史产品家族；停产", boundary: "Targa 不是 Imperial 改名或 Legacy 前身；标准、Slim 与 Fred Force 10 等特别版不能共用默认规格。", variants: [{ key: "targa-standard", name: "Standard Targa", releaseYear: "1976–约1998", notes: "标准家族路线；饰面不自动构成独立型号。", sourceKey: SOURCES.targa.key, variantKind: "variant" }, { key: "targa-slim", name: "Slim Targa", releaseYear: "1982–1995", notes: "独立尺寸路线，不能只凭视觉“细”判断。", sourceKey: SOURCES.targa.key, variantKind: "variant" }, { key: "targa-force10", name: "Fred Force 10 special edition", releaseYear: "1992–1996", notes: "合作/特别版，非标准 Targa 默认规格。", sourceKey: SOURCES.targa.key, variantKind: "edition_group" }] }),
];
