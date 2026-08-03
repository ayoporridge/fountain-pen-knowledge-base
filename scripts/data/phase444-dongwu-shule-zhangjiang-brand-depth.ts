import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";
import { phase235ObscureChineseTrioPacks } from "./phase235-obscure-chinese-trio";

const RETRIEVED = "2026-08-03";

export const PHASE444_BRAND_IDS = {
  dongwu: "v303FVWUV9sR",
  shule: "DnQI7CPpnewz",
  zhangjiang: "mZNUfRureJsC",
} as const;

function brandFrom(packs: readonly CuratedEntityPack[], entityId: string, label: string): CuratedEntityPack {
  const pack = packs.find((candidate) => candidate.entityId === entityId && candidate.expectedType === "brand");
  if (!pack) throw new Error(`Phase 444 ${label} brand pack is missing.`);
  return pack;
}

function forumSource(
  key: string,
  registryKey: string,
  title: string,
  url: string,
  independenceGroup: string,
  summary: string,
  author: string,
): CuratedSource {
  return {
    key,
    registryKey,
    registryName: "The Fountain Pen Network",
    sourceType: "forum",
    tier: "community",
    independenceGroup,
    title,
    url,
    homepageUrl: "https://www.fountainpennetwork.com/",
    author,
    publishedAt: null,
    retrievedAt: RETRIEVED,
    summary,
    allowedUse: "summary_only",
    archiveUrl: url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${title}`,
  };
}

function redditSource(
  key: string,
  title: string,
  url: string,
  summary: string,
): CuratedSource {
  return {
    key,
    registryKey: "reddit-changjiang-identity-phase444",
    registryName: "Reddit r/fountainpens participants",
    sourceType: "reddit",
    tier: "community",
    independenceGroup: "reddit-changjiang-identity-phase444",
    title,
    url,
    homepageUrl: "https://www.reddit.com/r/fountainpens/",
    author: "r/fountainpens participants",
    publishedAt: null,
    retrievedAt: RETRIEVED,
    summary,
    allowedUse: "summary_only",
    archiveUrl: url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${title}`,
  };
}

function sourceFrom(packs: readonly CuratedEntityPack[], key: string, label: string): CuratedSource {
  for (const pack of packs) {
    const source = pack.sources.find((candidate) => candidate.key === key);
    if (source) return source;
  }
  throw new Error(`Phase 444 ${label} source ${key} is missing.`);
}

function addSourcedClaim(
  base: CuratedEntityPack,
  source: CuratedSource,
  key: string,
  predicate: string,
  objectText: string,
): CuratedEntityPack["claims"][number] {
  const scopeKey = base.scopes[0]?.scopeKey ?? `${base.expectedSlug}-brand-scope`;
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence: 0.95,
    sourceKey: source.key,
    locator: source.summary,
    evidence: [{
      key: `${key}-evidence`,
      sourceKey: source.key,
      scopeKey,
      locator: source.summary,
    }],
  };
}

function refresh(
  base: CuratedEntityPack,
  key: string,
  markdownFile: string,
  storyTitle: string,
  extraSources: CuratedSource[],
  extraClaims: CuratedEntityPack["claims"],
): CuratedEntityPack {
  const existingKeys = new Set(base.sources.map((source) => source.key));
  return {
    ...base,
    key,
    markdownFile,
    storyTitle,
    sources: [...base.sources, ...extraSources.filter((source) => !existingKeys.has(source.key))],
    claims: [...base.claims, ...extraClaims],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const phase235 = phase235ObscureChineseTrioPacks();
const dongwuBase = brandFrom(phase235, PHASE444_BRAND_IDS.dongwu, "DongWu");
const shuleBase = brandFrom(phase235, PHASE444_BRAND_IDS.shule, "ShuLe");
const zhangjiangBase = brandFrom(phase235, PHASE444_BRAND_IDS.zhangjiang, "ZhangJiang");

const fpnChineseBrandList = forumSource(
  "phase444-fpn-chinese-brand-list",
  "fountain-pen-network-chinese-brand-list-phase444",
  "A List Of Chinese Pen Brands",
  "https://www.fountainpennetwork.com/forum/topic/240020-a-list-of-chinese-pen-brands/",
  "fpn-chinese-brand-list-phase444",
  "名录把中国旧钢笔品牌的资料稀疏和英文转写风险写在公开讨论中；它用于说明研究边界，不承担 DongWu、ShuLe 或 ZhangJiang 的法人与完整厂史结论。",
  "Seele",
);
const fpnKnownBrands = forumSource(
  "phase444-fpn-known-brands-index",
  "fountain-pen-network-known-brands-index-phase444",
  "Known Brands: China, Korea And Others — Asia",
  "https://www.fountainpennetwork.com/forum/topic/281037-known-brands-china-korea-and-others-asia/",
  "fpn-known-brands-index-phase444",
  "品牌索引展示 Changjiang 等中文名在海外收藏语境中的转写与不确定性；这里只作索引交叉线索，不把索引条目升级为型号规格。",
  "wimg",
);
const fpnShule2212 = forumSource(
  "phase444-fpn-shule-2212",
  "fountain-pen-network-shule-2212-phase444",
  "Shule Pens",
  "https://www.fountainpennetwork.com/forum/topic/100103-shule-pens/",
  "fpn-shule-2212-phase444",
  "2009 年讨论记录 ShuLe 2212 的金属笔身、暗尖、约 0.5 mm 窄尖和气囊式上墨样本；这些事实只属于 2212，不外推到 2398。",
  "vans4444",
);
const redditChangjiang = redditSource(
  "phase444-reddit-changjiang-28",
  "ID Please, grandpa bought this years ago in China",
  "https://www.reddit.com/r/fountainpens/comments/zmkmod",
  "收藏者讨论刻有长江字样的旧笔和可能的 28 型号线索；这是样本与命名旁证，不足以把 Changjiang 28 与 ZhangJiang 988 合并。",
);

export const phase444BrandDepthPacks: CuratedEntityPack[] = [
  refresh(
    dongwuBase,
    "phase444-dongwu-brand-depth-v1",
    ".planning/content-research/dongwu-brand-phase444.md",
    "东吴 DongWu：把一支旧笔放回可核验的品牌入口",
    [fpnChineseBrandList, fpnKnownBrands],
    [
      addSourcedClaim(dongwuBase, fpnChineseBrandList, "phase444-dongwu-source-boundary", "source_boundary", "中国钢笔品牌名录将旧国产品牌的资料稀疏与转写不确定性保留为研究边界；DongWu 948 的法人、工厂和年份不由名录缺项或相邻品牌补写。"),
      addSourcedClaim(dongwuBase, fpnKnownBrands, "phase444-dongwu-index-boundary", "brand_navigation", "公开品牌索引只提供检索和命名线索；东吴品牌页继续以具体 948 评测和逐样本刻字核验为公开入口。"),
    ],
  ),
  refresh(
    shuleBase,
    "phase444-shule-brand-depth-v1",
    ".planning/content-research/shule-brand-phase444.md",
    "书乐 ShuLe：从 2398 入口到相邻型号的证据边界",
    [fpnChineseBrandList, fpnShule2212],
    [
      addSourcedClaim(shuleBase, fpnShule2212, "phase444-shule-2212-boundary", "model_navigation", "Fountain Pen Network 的 ShuLe 2212 讨论是相邻型号样本，金属、暗尖、约 0.5 mm 和气囊上墨不能回填 ShuLe 2398。"),
      addSourcedClaim(shuleBase, fpnChineseBrandList, "phase444-shule-catalog-boundary", "source_boundary", "中文品牌名录的资料缺口提醒编辑不要从相邻旧国产笔补齐书乐的法人、厂史或完整目录。"),
    ],
  ),
  refresh(
    zhangjiangBase,
    "phase444-zhangjiang-brand-depth-v1",
    ".planning/content-research/zhangjiang-brand-phase444.md",
    "长江 ZhangJiang：把名称争议留在证据范围内",
    [fpnChineseBrandList, fpnKnownBrands, redditChangjiang],
    [
      addSourcedClaim(zhangjiangBase, fpnChineseBrandList, "phase444-zhangjiang-transliteration", "identity_boundary", "公开名录使用 Changjiang 与 Type 28 的转写线索；它不证明 Changjiang 28、ZhangJiang 988 和其他长江品牌名是同一制造者或同一型号。"),
      addSourcedClaim(zhangjiangBase, fpnKnownBrands, "phase444-zhangjiang-index", "brand_navigation", "品牌索引只支持检索与研究分流；ZhangJiang 988 仍以型号专属评测、刻字和结构照片作为公开入口。"),
      addSourcedClaim(zhangjiangBase, redditChangjiang, "phase444-zhangjiang-community-boundary", "community_boundary", "Reddit 的长江旧笔讨论仅提供 28 型号命名旁证，不能把个体收藏样本升级为 ZhangJiang 988 的统一规格。"),
    ],
  ),
];

if (
  phase444BrandDepthPacks.length !== 3 ||
  new Set(phase444BrandDepthPacks.map((pack) => pack.entityId)).size !== 3
) {
  throw new Error("Phase 444 brand refresh must contain three unique brands.");
}

export { sourceFrom };
