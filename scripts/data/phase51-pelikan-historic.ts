import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase27PelikanPacks } from "./phase27-pelikan";

export const PHASE51_PELIKAN_ID = "VXUULuCOLOB1";
export const PHASE51_MODEL_100_ID = "s51PEL100";
export const PHASE51_MODEL_100N_ID = "s51PEL100N";
export const PHASE51_PELIKANO_ID = "s51PELIKANO";

const RETRIEVED = "2026-07-19";

function live(input: { key: string; title: string; url: string; registryKey: string; registryName: string; type: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string; author?: string; itemType?: string }): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.type,
    tier: input.tier,
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.url,
    itemType: input.itemType,
    author: input.author ?? input.registryName,
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
  model100Archive: live({ key: "phase51-pelikan-model-100-archive", title: "Pelikan Collectibles: Model 100 (1929–1944)", url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Historic-Pens/100/index.html", registryKey: "pelikan-collectibles", registryName: "Pelikan Collectibles", type: "blog", tier: "professional_secondary", summary: "专业历史档案记录 Model 100 的 1929–1944 时间线、尺寸容量、帽盖、材料、战争版本与 100/101/110/111 分支。", locator: "timeline 1929-1944; Model 100 table; variants and production colors" }),
  model100Details: live({ key: "phase51-pelikan-model-100-details", title: "Pelikan Collectibles: Model 100 Technical Details", url: "https://www.pelikan-collectibles.com/en/Pelikan/Surroundings/Modell-100-Details/index.html", registryKey: "pelikan-collectibles", registryName: "Pelikan Collectibles", type: "blog", tier: "professional_secondary", summary: "技术页说明早期帽盖、Bakelite／celluloid、三鳍导墨器、笔尖套管和 100 与 100N 的结构差异。", locator: "cap, material, nib unit and ink-feed sections" }),
  nibUnits: live({ key: "phase51-pelikan-nib-units-1929", title: "Pelikan Collectibles: Nib Units since 1929", url: "https://www.pelikan-collectibles.com/en/Pelikan/Nibs/Nib-units-since-1929/index.html", registryKey: "pelikan-collectibles", registryName: "Pelikan Collectibles", type: "blog", tier: "professional_secondary", summary: "档案记录 100 系列金、PD、CN 尖与可旋入笔尖单元，明确 100 与 100N 尖尺寸和材料过渡。", locator: "series 100/100N nib imprints, palladium and chromium-nickel steel" }),
  model100nArchive: live({ key: "phase51-pelikan-model-100n-archive", title: "Pelikan Collectibles: Model 100N (1937–1954)", url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Historic-Pens/100N/index.html", registryKey: "pelikan-collectibles", registryName: "Pelikan Collectibles", type: "blog", tier: "professional_secondary", summary: "专业档案记录 100N 的出口先行、德国上市、1937–1954 生产期、1.75 ml 容量、握位改款和 Gdansk／War 变体。", locator: "timeline 1937-1954; 100N table; Gdansk, war, Gold, Toledo and 101N variants" }),
  model100nDetails: live({ key: "phase51-pelikan-model-100-details", title: "Pelikan Collectibles: Model 100 Technical Details", url: "https://www.pelikan-collectibles.com/en/Pelikan/Surroundings/Modell-100-Details/index.html", registryKey: "pelikan-collectibles", registryName: "Pelikan Collectibles", type: "blog", tier: "professional_secondary", summary: "技术页说明早期帽盖、Bakelite／celluloid、三鳍导墨器、笔尖套管和 100 与 100N 的结构差异。", locator: "cap, material, nib unit and ink-feed sections" }),
  officialHistory: live({ key: "phase51-pelikan-official-history", title: "Pelikan official history", url: "https://www.pelikan.com/int/brand/our-history.html", registryKey: "pelikan-official-phase51", registryName: "Pelikan official site", type: "official", tier: "primary", summary: "官方历史年表确认 1929 年首支 Pelikan 钢笔、1832/1838 品牌起点及后续生产迁移。", locator: "1929 first fountain pen timeline entry" }),
  pelikanoArchive: live({ key: "phase51-pelikan-pelikano-archive", title: "Pelikan Collectibles: The Pelikano — History", url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Cartridge-filler/Pelikano/index.html", registryKey: "pelikan-collectibles", registryName: "Pelikan Collectibles", type: "blog", tier: "professional_secondary", summary: "家族档案覆盖 1960 Model 1、1965 Model 2、1968 Model 3、1973 Model 4、1979 Model 5、1983 Model 6、1989 Model 7、P450、P480 与 Structure。", locator: "Pelikano timeline 1960-today; generation tables, nibs, filling and dimensions" }),
  pelikanoOfficial: live({ key: "phase51-pelikan-pelikano-official-history", title: "Pelikan official history: 1960 Pelikano", url: "https://www.pelikan.com/ae/brand/pelikan-history.html", registryKey: "pelikan-official", registryName: "Pelikan official site", type: "official", tier: "primary", summary: "官方历史页将 1960 年 Pelikano 定位为书写教师与钢笔设计师合作的学生产品，并记录教育字体项目。", locator: "1960 birth of a classic; 1974 simplified handwriting" }),
  model100Svg: diagram("phase51-pelikan-100-svg", "Pelikan Model 100 年代事实卡", "/images/library/site-original/pelikan-historic/pelikan-100.svg", "本站原创事实图，区分 1929–1944 时间线、差动活塞与金／PD／CN 尖材；示意图，非产品照片。"),
  model100nSvg: diagram("phase51-pelikan-100n-svg", "Pelikan Model 100N 版本事实卡", "/images/library/site-original/pelikan-historic/pelikan-100n.svg", "本站原创事实图，区分 1937–1954 出口先行、握位与尖材变化；示意图，非产品照片。"),
  pelikanoSvg: diagram("phase51-pelikan-pelikano-svg", "Pelikan Pelikano 代际事实卡", "/images/library/site-original/pelikan-historic/pelikano.svg", "本站原创事实图，区分 Pelikano 1960、1979、2000、2017 与 2024 代际、墨囊和握位；示意图，非产品照片。"),
};

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
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
  aliases: string[];
  release: string;
  nib: string;
  fill: string;
  material: string;
  dimensions: string;
  status: string;
  boundary: string;
  variants: Array<{ key: string; name: string; releaseYear?: string; productCode?: string; notes: string; sourceKey: string }>;
}): CuratedEntityPack {
  const scopeKey = `${input.key}-scope`;
  const sources = [input.primary, input.secondary, ...input.extra, input.svg].filter((source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index);
  return {
    key: `phase51-${input.key}-v1`, entityId: input.id, expectedType: "pen", expectedSlug: input.slug, canonicalName: input.name,
    publicationIntent: "publish", publicationBlockers: [], markdownFile: input.markdownFile, storyTitle: input.title, primarySourceKey: input.primary.key, depthTier: "A",
    aliases: input.aliases.map((alias, index) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: index === 0 ? input.primary.key : input.secondary.key })),
    sources,
    scopes: [{ key: scopeKey, scopeKey, productionState: input.status.includes("历史") ? "historical" : "current", editionScope: "Pelikan 具体型号或家族；年代、市场与材料按 variant 记录" }],
    claims: [
      { key: `${input.key}-identity`, predicate: "model_identity", objectText: input.summary, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: "archival model identity", evidence: [{ key: `${input.key}-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: "model title and dated archive entry" }] },
      { key: `${input.key}-boundary`, predicate: "version_boundary", objectText: input.boundary, factClass: "core", confidence: 0.98, sourceKey: input.secondary.key, locator: "historical family boundary", evidence: [{ key: `${input.key}-boundary-evidence`, sourceKey: input.secondary.key, scopeKey, locator: "professional archive boundary" }, { key: `${input.key}-official-boundary`, sourceKey: input.primary.key, scopeKey, locator: "official or archival model distinction" }] },
      { key: `${input.key}-care`, predicate: "maintenance_boundary", objectText: "Pelikan 历史笔应先排空墨水，再用室温水轻柔吸排；不使用热水、酒精或溶剂，不在未确认材料和密封状态时强行拆活塞或尖座。", factClass: "core", confidence: 0.96, sourceKey: input.primary.key, locator: "Pelikan filling and archival maintenance boundary", evidence: [{ key: `${input.key}-care-evidence`, sourceKey: input.primary.key, scopeKey, locator: "archival filling system and material context" }] },
    ],
    variants: input.variants.map((variant) => ({ ...variant, variantKind: "edition_group" as const })),
    spec: {
      brandEntityId: PHASE51_PELIKAN_ID,
      values: { series_name: input.name, release_year: input.release, origin_country: "Pelikan 德国品牌；制造地与出口市场按具体档案核对", nib: input.nib, fill_system: input.fill, material: input.material, dimensions: input.dimensions, status: input.status },
      evidence: [evidence("brand_entity_id", `${input.key}-brand`, input.primary.key, scopeKey, "Pelikan maker identity"), evidence("series_name", `${input.key}-series`, input.primary.key, scopeKey, "archival model title"), evidence("release_year", `${input.key}-release`, input.primary.key, scopeKey, "dated production timeline"), evidence("origin_country", `${input.key}-origin`, input.primary.key, scopeKey, "brand/archive context; no factory inference"), evidence("nib", `${input.key}-nib`, input.primary.key, scopeKey, "nib table and dated material transition"), evidence("fill_system", `${input.key}-fill`, input.primary.key, scopeKey, "filling system section"), evidence("material", `${input.key}-material`, input.secondary.key, scopeKey, "material and construction history"), evidence("dimensions", `${input.key}-dimensions`, input.primary.key, scopeKey, "archival dimensions table"), evidence("status", `${input.key}-status`, input.primary.key, scopeKey, "production period / current family boundary")],
    },
    media: [{ key: `${input.key}-primary`, title: `${input.name} 事实卡（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影，不表现真实比例、颜色、Logo 或刻字。", sourceUrl: input.svg.url, usageStatus: "primary" }],
    timeline: [{ key: `${input.key}-timeline`, title: `${input.name} 进入 Pelikan 产品史`, eventType: "model_released", startDate: input.release.match(/\d{4}/)?.[0] ?? "1960", circa: true, description: input.summary, sourceKey: input.primary.key }],
  };
}

const brand = structuredClone(phase27PelikanPacks.find((pack) => pack.entityId === PHASE51_PELIKAN_ID && pack.expectedType === "brand"));
if (!brand) throw new Error("Phase 51 Pelikan brand pack missing.");
brand.key = "phase51-pelikan-brand-v1";

export const phase51PelikanHistoricPacks: CuratedEntityPack[] = [
  brand,
  makePen({ key: "model-100", id: PHASE51_MODEL_100_ID, slug: "pelikan-model-100", name: "百利金 Pelikan Model 100", title: "Pelikan Model 100：1929–1944 的差动活塞源头", summary: "Pelikan Model 100 是 1929 年推出、1944 年德国停产的历史活塞钢笔，经历金尖、PD 钯尖、CN 钢尖、材料与战争帽环变化。", markdownFile: ".planning/content-research/pelikan-model-100.md", primary: SOURCES.officialHistory, secondary: SOURCES.model100Archive, extra: [SOURCES.model100Details, SOURCES.nibUnits], svg: SOURCES.model100Svg, aliases: ["Pelikan Model 100", "Pelikan 100", "百利金 100", "Ur-Pelikan"], release: "1929–1944", nib: "14 ct 金尖；1938–1940 PD 钯尖；1939–1944 CN 铬镍钢尖；部分出口 18 ct", fill: "内置差动活塞，瓶装墨水，约 1.5 ml 档案参考值", material: "早期 Bakelite／硬橡胶与 celluloid，后期注塑树脂；黑帽与绿纹／黑色版本", dimensions: "闭帽约 117 mm、直径约 12 mm、约 13.9 g、约 1.5 ml；档案参考值", status: "历史停产；1929–1944", boundary: "Model 100 是历史 100 系列，不是现代 M100 或 Classic M200；100N 于 1937 年作为 New 版本另立页面，尺寸、容量和尖略有不同。", variants: [{ key: "100-early", name: "1929–1930 early Model 100", releaseYear: "1929–1930", notes: "圆柱帽顶、无帽环、心形呼吸孔与 Bakelite 结构；1930 年 11 月后呼吸孔改为圆形。", sourceKey: SOURCES.model100Archive.key }, { key: "100-1931", name: "1931–1937 revised Model 100", releaseYear: "1931–1937", notes: "锥形帽顶、分体笔杆与硬橡胶握位；套管由 17 mm 缩为 12 mm。", sourceKey: SOURCES.model100Details.key }, { key: "100-war", name: "1940–1944 war-era Model 100", releaseYear: "1940–1944", notes: "浅绿墨窗、光滑旋钮、无金属帽环或塑料模拟帽环、合成密封与 CN 尖等线索。", sourceKey: SOURCES.model100Archive.key }] }),
  makePen({ key: "model-100n", id: PHASE51_MODEL_100N_ID, slug: "pelikan-model-100n", name: "百利金 Pelikan Model 100N", title: "Pelikan Model 100N：出口先行的 New 版本", summary: "Pelikan Model 100N 是 1937 年推出、1954 年停产的 New 版本，先出口后进入德国市场，拥有更大笔身、约 1.75 ml 容量和多代尖材与握位变化。", markdownFile: ".planning/content-research/pelikan-model-100n.md", primary: SOURCES.officialHistory, secondary: SOURCES.model100nArchive, extra: [SOURCES.model100nDetails, SOURCES.nibUnits], svg: SOURCES.model100nSvg, aliases: ["Pelikan Model 100N", "Pelikan 100N", "百利金 100N", "Pelikan New 100"], release: "1937–1954", nib: "14 ct 金尖；PD 钯尖；CN 铬镍钢尖；1949 后金尖恢复，1953 后停用钢尖；部分出口 18 ct", fill: "内置差动活塞，瓶装墨水，约 1.75 ml 档案参考容量", material: "绿纹、黑色与浅绿墨窗版本；celluloid／注塑树脂、黑帽、金色或银色饰件", dimensions: "闭帽约 122 mm、直径约 12 mm、约 14.5 g；笔杆约 99 mm、帽约 61 mm", status: "历史停产；1937–1954", boundary: "100N 是 Model 100 的 New 发展线，不能与 100、101N、M101N 或现代 M 系列合并；1937 年出口先行、1938 年德国上市是重要市场边界。", variants: [{ key: "100n-early", name: "1937–1949 first-generation 100N", releaseYear: "1937–1949", notes: "出口先行、四／两雏鸟标志、普通或 fluted 帽环；1938–1940 可见 PD，1939 起可见 CN。", sourceKey: SOURCES.model100nArchive.key }, { key: "100n-late", name: "1949–1954 second-generation 100N", releaseYear: "1949–1954", notes: "握位改款、金尖恢复；1950 年起导墨器有便于拆卸的缺口，1953 年出现透明宽密封。", sourceKey: SOURCES.model100nArchive.key }, { key: "100n-gdansk", name: "100N Gdansk / War variants", releaseYear: "1937–1954", notes: "菱形夹尾、仅一道帽环或无帽环滚花等收藏家称呼，必须以实物组合核对。", sourceKey: SOURCES.model100nArchive.key }] }),
  makePen({ key: "pelikano", id: PHASE51_PELIKANO_ID, slug: "pelikan-pelikano", name: "百利金 Pelikan Pelikano", title: "Pelikan Pelikano：从 1960 Model 1 到 Structure 的学生钢笔家族", summary: "Pelikano 是 Pelikan 面向学校与初学者的墨囊钢笔家族，1960 年推出并持续经历 Model 1–7、P450、P480 与 Structure 等代际更新。", markdownFile: ".planning/content-research/pelikan-pelikano.md", primary: SOURCES.pelikanoOfficial, secondary: SOURCES.pelikanoArchive, extra: [SOURCES.officialHistory], svg: SOURCES.pelikanoSvg, aliases: ["Pelikan Pelikano", "Pelikano fountain pen", "百利金 Pelikano", "Pelikan P450", "Pelikan P480"], release: "1960–至今", nib: "钢尖；F、M、L（左手）与 A（学写）等字幅依代际和市场", fill: "Pelikan 墨囊；部分日本市场旧版使用活塞转换器", material: "树脂笔杆、金属或树脂帽、软握位；2000 透明哑光、2024 Structure 依版本", dimensions: "代际差异大；P450 2000 参考闭帽 132 mm、13.2 g、约 1.4 ml giant cartridge", status: "家族现行与历史代际并存", boundary: "Pelikano 是教育产品家族，不是单一现代 SKU；Model 1、2、3、4、5、6、7、P450、P480／P481、Pelikano UP 与 Structure 应按年份、握位、左右手和帽材拆开。", variants: [{ key: "pelikano-1", name: "Pelikano Model 1", releaseYear: "1960–1965", notes: "第一支 Pelikan 墨囊学生笔，蓝银配色、钢尖、铝帽；1963–1964 有黑色出口版本。", sourceKey: SOURCES.pelikanoArchive.key }, { key: "pelikano-2-4", name: "Pelikano Model 2–4", releaseYear: "1965–1978", notes: "旋转墨窗、尖嘴夹、扁平更耐压的钢尖、Model 3/4 握位与导墨器变化；颜色和 Antimacchia 依市场。", sourceKey: SOURCES.pelikanoArchive.key }, { key: "pelikano-5-7", name: "Pelikano Model 5–7", releaseYear: "1979–1999", notes: "新钢尖、两／三条握位凹槽、P456 出口与 P452/P453 Super 等分支。", sourceKey: SOURCES.pelikanoArchive.key }, { key: "pelikano-p450", name: "Pelikano 2000 / P450", releaseYear: "2000–2003", notes: "半透明哑光色、不锈钢帽、Dynamic Clip、F/M/L/A；约 132 mm、13.2 g、1.4 ml giant cartridge 档案参考值。", sourceKey: SOURCES.pelikanoArchive.key }, { key: "pelikano-p480", name: "Pelikano 2015/2017 P480/P481", releaseYear: "2015–至今的代际记录", notes: "有色不透明握位、两个长形墨窗、右手 P480 与左手 P481；2017 年握位表面变软。", sourceKey: SOURCES.pelikanoArchive.key }, { key: "pelikano-structure", name: "Pelikano Structure", releaseYear: "2024–", notes: "新纹理与闪光材料，档案参考闭帽 135 mm、18.4 g、直径约 14.6 mm、1.4 ml giant cartridge；不能用 P450 尺寸回填。", sourceKey: SOURCES.pelikanoArchive.key }] }),
];
