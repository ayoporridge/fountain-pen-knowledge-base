import type {
  CuratedClaimEvidence,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  phase83WatermanCurrentPacks,
  PHASE83_WATERMAN_BRAND_ID,
} from "./phase83-waterman-current";

export const PHASE162_IDS = {
  no52: "AqN2ex1B7A2S",
  no7: "LABL8G83Je3e",
} as const;
export const PHASE162_WATERMAN_BRAND_ID = PHASE83_WATERMAN_BRAND_ID;
export const PHASE162_RETRIEVED = "2026-07-24";
const SCOPE = "phase162-waterman-ideal";

function web(input: {
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
    ...input,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: PHASE162_RETRIEVED,
    allowedUse: "summary_only",
    independenceGroup: input.registryKey,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${PHASE162_RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}
function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase162",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase162",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: PHASE162_RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  history: web({
    key: "phase162-waterman-history",
    title: "Waterman Heritage",
    url: "https://www.waterman.com/waterman-history.html",
    registryKey: "waterman-official-phase162",
    registryName: "Waterman",
    sourceType: "official",
    tier: "primary",
    summary: "Waterman 官方 heritage 页面提供品牌和产品线背景；No.52/No.7 的编号与版本仍以专业型号档案交叉核对。",
    locator: "heritage and brand timeline",
  }),
  no52: web({
    key: "phase162-no52-richard",
    title: "Richard’s Pens：Profile, Waterman’s Ideal No. 52",
    url: "https://www.richardspens.com/ref/profiles/52.htm",
    registryKey: "richardspens-phase162-no52",
    registryName: "Richard Binder / Richard’s Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "专业型号档案记录 12PSF 到 52 的编号转换、No.2 与杠杆含义、硬橡胶、Ripple、52V、overlay、celluloid 和 flex 误读风险。",
    locator: "numbering, materials, versions, nib and collector sections",
  }),
  no52Patent: web({
    key: "phase162-no52-patent",
    title: "U.S. Patent 1,197,360：Waterman boxed lever",
    url: "https://patents.google.com/patent/US1197360A/en",
    registryKey: "us-patent-phase162-no52",
    registryName: "United States Patent and Trademark Office",
    sourceType: "patent",
    tier: "contemporary_archive",
    summary: "专利档案承接 Waterman 以 boxed lever 处理杠杆上墨结构的历史证据。",
    locator: "boxed lever patent drawing and claims",
  }),
  no7: web({
    key: "phase162-no7-richard",
    title: "Richard’s Pens：Profile, Waterman’s No. 7 and No. 5",
    url: "https://www.richardspens.com/ref/profiles/no7.htm",
    registryKey: "richardspens-phase162-no7",
    registryName: "Richard Binder / Richard’s Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "专业型号档案记录 1927 年 No.7、Ripple、彩色笔尖和 casein 色带、Jet/color disk、Emerald-Ray 及后期数字 7。",
    locator: "history, color-coded nib, material generations and collector boundary",
  }),
  no7Index: web({
    key: "phase162-no7-reference-index",
    title: "Richard’s Pens：Waterman reference index",
    url: "https://www.richardspens.com/ref/",
    registryKey: "richardspens-phase162-reference-index",
    registryName: "Richard Binder / Richard’s Pens",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary: "参考索引用于确认 No.7 档案在 Waterman 型号体系中的位置，不替代型号页的具体版本证据。",
    locator: "reference index and Waterman profiles",
  }),
  no52Svg: diagram("phase162-no52-svg", "Waterman Ideal No. 52 factual diagram", "/images/library/site-original/phase162/waterman/ideal-no52.svg"),
  no7Svg: diagram("phase162-no7-svg", "Waterman Ideal No. 7 factual diagram", "/images/library/site-original/phase162/waterman/ideal-no7.svg"),
} as const;

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}
function claimEvidence(key: string, sourceKey: string, locator: string): CuratedClaimEvidence {
  return { key, sourceKey, scopeKey: SCOPE, locator };
}
type Input = {
  key: string;
  id: string;
  slug: string;
  name: string;
  file: string;
  title: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  extra: CuratedSource[];
  art: CuratedSource;
  summary: string;
  boundary: string;
  care: string;
  values: Record<SpecFieldKey, string>;
  aliases: string[];
  variants: CuratedEntityPack["variants"];
};

function pen(input: Input): CuratedEntityPack {
  const sources = [S.history, input.primary, input.secondary, ...input.extra, input.art].filter(
    (source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index,
  );
  return {
    key: `phase162-waterman-${input.key}-v1`,
    entityId: input.id,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.file,
    storyTitle: input.title,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: input.aliases.map((alias, index) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: index === 0 ? input.primary.key : input.secondary.key })),
    sources,
    scopes: [{ key: SCOPE, scopeKey: SCOPE, validFrom: PHASE162_RETRIEVED, productionState: "historical", editionScope: `${input.name} 历史型号；材料、颜色、尖幅、制造地和维修状态按具体实物核对。` }],
    claims: [
      { key: `phase162-${input.key}-identity`, predicate: "model_identity", objectText: input.summary, factClass: "core", confidence: 0.98, sourceKey: input.primary.key, locator: input.primary.summary, evidence: [claimEvidence(`phase162-${input.key}-identity-primary`, input.primary.key, input.primary.summary), claimEvidence(`phase162-${input.key}-identity-official`, S.history.key, S.history.summary)] },
      { key: `phase162-${input.key}-boundary`, predicate: "version_boundary", objectText: input.boundary, factClass: "core", confidence: 0.97, sourceKey: input.primary.key, locator: input.primary.summary, evidence: [claimEvidence(`phase162-${input.key}-boundary-primary`, input.primary.key, input.primary.summary), claimEvidence(`phase162-${input.key}-boundary-extra`, input.extra[0]?.key ?? input.secondary.key, input.extra[0]?.summary ?? input.secondary.summary)] },
      { key: `phase162-${input.key}-care`, predicate: "maintenance", objectText: input.care, factClass: "editorial", confidence: 0.96, sourceKey: input.primary.key, locator: input.primary.summary, evidence: [claimEvidence(`phase162-${input.key}-care-primary`, input.primary.key, input.primary.summary), claimEvidence(`phase162-${input.key}-care-official`, S.history.key, S.history.summary)] },
    ],
    variants: input.variants,
    spec: {
      brandEntityId: PHASE162_WATERMAN_BRAND_ID,
      values: input.values,
      evidence: [
        evidence(`phase162-${input.key}-brand`, "brand_entity_id", input.primary.key, "Waterman identity"),
        evidence(`phase162-${input.key}-series`, "series_name", input.primary.key, "model identity"),
        evidence(`phase162-${input.key}-release`, "release_year", input.primary.key, "historical placement"),
        evidence(`phase162-${input.key}-origin`, "origin_country", S.history.key, "Waterman product-line context"),
        evidence(`phase162-${input.key}-nib`, "nib", input.primary.key, "nib numbering and point boundary"),
        evidence(`phase162-${input.key}-fill`, "fill_system", input.primary.key, "boxed lever and sac filling"),
        evidence(`phase162-${input.key}-material`, "material", input.primary.key, "hard rubber, Ripple and celluloid"),
        evidence(`phase162-${input.key}-dimensions`, "dimensions", input.primary.key, "version and sample dimensions"),
        evidence(`phase162-${input.key}-weight`, "weight", input.primary.key, "no universal weight; sample boundary"),
        evidence(`phase162-${input.key}-status`, "status", input.primary.key, "historical circulation"),
        evidence(`phase162-${input.key}-price`, "price_range", input.primary.key, "condition and collector-market boundary"),
      ],
    },
    media: [{ key: `phase162-${input.key}-primary-media`, title: `${input.name} 事实示意图（非产品照片）`, sourceKey: input.art.key, localPath: input.art.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片。", sourceUrl: input.art.url, usageStatus: "primary" }],
    timeline: [],
  };
}

const no52 = pen({
  key: "no52",
  id: PHASE162_IDS.no52,
  slug: "waterman-s-ideal-no52",
  name: "Waterman’s Ideal No. 52",
  file: ".planning/content-research/waterman-ideal-no52-phase162.md",
  title: "Waterman’s Ideal No. 52：硬橡胶时代的编号基准",
  primary: S.no52,
  secondary: S.history,
  extra: [S.no52Patent],
  art: S.no52Svg,
  summary: "Waterman’s Ideal No. 52 是约 1917 年规范化编号后的硬橡胶杠杆笔，5 指杠杆、2 指 No.2 尖，并经历 52V、Ripple、overlay 与 celluloid 版本。",
  boundary: "52、52½、52V、ringtop、overlay 与后期 celluloid 共享产品线但不共享尺寸和装饰；52x 是 No.2 尖的大笔身例外，不能凭照片合并。",
  care: "硬橡胶用常温水和软布清洁，避开热水、酒精、长泡和强力抛光；检查 boxed lever、sac、section、螺纹和材料氧化，必要时交给 vintage Waterman 维修者。",
  values: { series_name: "Ideal No. 52", release_year: "约 1917 年由 12PSF 规范为 52；硬橡胶长期销售，1934 年左右出现 celluloid 版本", origin_country: "美国 Waterman 历史产品线；具体制造地按刻字和目录核对", nib: "No.2 笔尖；尖幅、弹性和原装程度按具体实物", fill_system: "Waterman boxed lever 与 sac 杠杆上墨", material: "黑色硬橡胶、追波纹、Ripple、overlay；后期有 celluloid", dimensions: "标准 52、缩小 52½、短款 52V 和 52x 大笔身不同；按实物测量", weight: "公开资料未提供可外推的统一重量；按具体样本", status: "历史型号；二手收藏和维修流通为主", price_range: "随材料、Ripple/overlay、52V、笔尖健康、原装度和维修史变化", brand_entity_id: PHASE162_WATERMAN_BRAND_ID },
  aliases: ["Waterman’s Ideal No. 52", "Waterman's Ideal No. 52", "Waterman Ideal No. 52", "威迪文 Ideal 52"],
  variants: [
    { key: "phase162-no52-standard", name: "标准 52", notes: "No.2 与 boxed lever 的基础规格。", sourceKey: S.no52.key, variantKind: "edition_group" },
    { key: "phase162-no52-v", name: "52V / ringtop", notes: "短小或环顶携带版本，尺寸和帽顶结构不同。", sourceKey: S.no52.key, variantKind: "edition_group" },
    { key: "phase162-no52-ripple", name: "Ripple 与 overlay", notes: "材料纹理和贵金属装饰跨越多个编号前缀，需核对刻字和实物。", sourceKey: S.no52.key, variantKind: "material" },
  ],
});

const no7 = pen({
  key: "no7",
  id: PHASE162_IDS.no7,
  slug: "waterman-s-ideal-no7",
  name: "Waterman’s Ideal No. 7",
  file: ".planning/content-research/waterman-ideal-no7-phase162.md",
  title: "Waterman’s Ideal No. 7：把笔尖写感做成颜色语言",
  primary: S.no7,
  secondary: S.history,
  extra: [S.no7Index],
  art: S.no7Svg,
  summary: "Waterman’s Ideal No. 7 是 1927 年的大型 Ripple 硬橡胶型号，以彩色笔尖和匹配色带标记点型，后续经历 Jet、Emerald-Ray 与数字 7。",
  boundary: "No.7 的彩色 nib、casein 色带、Jet color disk、Emerald-Ray 和后期数字 7 不是同一版本；White 尖存在伪造风险，不能只按颜色凑套装。",
  care: "硬橡胶与 casein 避开热水、溶剂和过度抛光；检查 Ripple、色带、color disk、sac、section 和笔尖裂纹，日用前先以试写确认实际写感。",
  values: { series_name: "Ideal No. 7 / Number Seven", release_year: "1927；1928 年有 No.5 companion，1929 年后转向部分 celluloid/Jet 版本", origin_country: "美国 Waterman 历史产品线；具体制造地按刻字和目录核对", nib: "较大笔尖与 Red/Green/Pink/Blue/Yellow/Purple 等 color-coded points；后期有 Brown 等和数字 7", fill_system: "Waterman 杠杆 sac 上墨；不同材料世代的内部细节按实物核对", material: "Ripple 硬橡胶、Jet/celluloid、Emerald-Ray 等材料与颜色世代", dimensions: "早期约 5 英寸带帽、上墨后超过 7 英寸；后期尺寸和长度变化，按样本测量", weight: "公开资料未提供可外推的统一重量；按具体样本", status: "历史型号；彩色笔尖收藏和维修流通为主", price_range: "随 nib color、Ripple/Jet/Emerald-Ray、色带、原配程度和维修史变化", brand_entity_id: PHASE162_WATERMAN_BRAND_ID },
  aliases: ["Waterman’s Ideal No. 7", "Waterman's Ideal No. 7", "Waterman Ideal No. 7", "Waterman Number Seven", "威迪文 Ideal 7"],
  variants: [
    { key: "phase162-no7-ripple-color", name: "Ripple 彩色笔尖组", notes: "颜色承担点型识别，需核对 nib 刻字和 casein 色带是否原配。", sourceKey: S.no7.key, variantKind: "nib" },
    { key: "phase162-no7-jet", name: "Jet 与 barrel-end color disk", notes: "celluloid/Jet 世代把颜色识别移到笔尾圆盘。", sourceKey: S.no7.key, variantKind: "material" },
    { key: "phase162-no7-ray-number", name: "Emerald-Ray 与后期数字 7", notes: "Ray suit 和无彩色名的数字 7 是后期边界，不等于早期彩色尖。", sourceKey: S.no7.key, variantKind: "edition_group" },
  ],
});

const brandBase = phase83WatermanCurrentPacks("phase83-pen-waterman-allure").find((pack) => pack.expectedType === "brand");
if (!brandBase) throw new Error("Phase 162 requires the existing Waterman brand pack.");
const watermanBrand = structuredClone(brandBase);
watermanBrand.key = "phase162-waterman-brand-ideal-navigation";
watermanBrand.sources = [...watermanBrand.sources, S.no52, S.no7].filter((source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index);

export const phase162WatermanIdealPacks: CuratedEntityPack[] = [watermanBrand, no52, no7];
