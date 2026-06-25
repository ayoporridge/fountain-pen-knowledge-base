import fs from "node:fs";
import path from "node:path";
import { createClient, type Client, type InArgs } from "@libsql/client";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");
const WRITE = process.argv.includes("--write");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));

type SourceRegistrySeed = {
  id: string;
  name: string;
  sourceType:
    | "official"
    | "wikimedia"
    | "book"
    | "patent"
    | "blog"
    | "forum"
    | "reddit"
    | "retailer"
    | "user_submission";
  allowedUse: "store_full" | "store_excerpt" | "summary_only" | "metadata_only" | "link_only" | "forbidden";
  reliability:
    | "high_for_basic_facts"
    | "high_for_model_history"
    | "official_marketing"
    | "community_opinion"
    | "bibliographic"
    | "technical_primary"
    | "medium"
    | "unknown";
  attribution: string;
  homepageUrl: string;
  fetchMethod: string;
  notes: string;
};

type SourceItemSeed = {
  id: string;
  sourceId: string;
  title: string;
  url: string;
  itemType: string;
  author: string;
  publishedAt?: string;
  summary: string;
  allowedUse: "store_full" | "store_excerpt" | "summary_only" | "metadata_only" | "link_only" | "forbidden";
  reviewStatus: "pending" | "approved" | "rejected" | "needs_review";
};

type AliasSeed = {
  alias: string;
  language: string;
  sourceId?: string;
};

type ClaimSeed = {
  id: string;
  predicate: string;
  text: string;
  sourceItemId: string;
  evidenceLocator?: string;
  confidence: number;
  reviewStatus: "pending" | "approved" | "rejected" | "needs_source";
};

type StorySeed = {
  id: string;
  title: string;
  storyType: "brand_story" | "model_story";
  summary: string;
  bodyMd: string;
  status: "draft" | "needs_sources" | "needs_media" | "reviewed" | "published" | "deprecated";
  sourceNotes: string;
  sourceItemIds: string[];
  claimIds: string[];
};

type TimelineSeed = {
  id: string;
  title: string;
  eventType:
    | "brand_founded"
    | "model_released"
    | "patent_filed"
    | "acquisition"
    | "discontinued"
    | "revival"
    | "design_milestone"
    | "community_event";
  startDate: string;
  circa?: boolean;
  description: string;
  sourceItemId: string;
  reviewStatus: "pending" | "approved" | "rejected" | "needs_source";
};

type ExternalIdSeed = {
  provider: string;
  externalId: string;
  url: string;
  metadataJson?: string;
};

type BrandSeed = {
  slug: string;
  aliases: AliasSeed[];
  sourceItemIds: string[];
  claims: ClaimSeed[];
  story: StorySeed;
  timeline?: TimelineSeed;
  externalIds?: ExternalIdSeed[];
};

type ModelSpecSeed = {
  id: string;
  seriesName: string;
  releaseYear: string;
  originCountry: string;
  nib: string;
  fillSystem: string;
  material: string;
  dimensions: string;
  weight: string;
  priceRange: string;
  status: string;
  reviewStatus: "pending" | "approved" | "rejected" | "needs_source";
};

type VariantSeed = {
  id: string;
  name: string;
  releaseYear?: string;
  notes: string;
  sourceItemId?: string;
  reviewStatus: "pending" | "approved" | "rejected" | "needs_source";
};

type ModelSeed = {
  slug: string;
  brandSlug: string;
  aliases: AliasSeed[];
  sourceItemIds: string[];
  spec: ModelSpecSeed;
  story: StorySeed;
  claims: ClaimSeed[];
  variants?: VariantSeed[];
  timeline?: TimelineSeed;
};

type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
};

const SOURCE_REGISTRY: SourceRegistrySeed[] = [
  {
    id: "dareworks-official",
    name: "逗万 DareWorks official site",
    sourceType: "official",
    allowedUse: "summary_only",
    reliability: "official_marketing",
    attribution: "逗万 DareWorks",
    homepageUrl: "http://www.damiwonka.com/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use for official DouWan/DareWorks brand and product positioning. Treat tone as marketing copy; summarize and cite, do not copy.",
  },
  {
    id: "fountain-pen-network",
    name: "Fountain Pen Network",
    sourceType: "forum",
    allowedUse: "summary_only",
    reliability: "community_opinion",
    attribution: "Fountain Pen Network contributors",
    homepageUrl: "https://www.fountainpennetwork.com/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use as community review context only. Do not treat individual posts as official product specifications.",
  },
  {
    id: "public-web-research-index",
    name: "Public web research index",
    sourceType: "user_submission",
    allowedUse: "link_only",
    reliability: "unknown",
    attribution: "Project editorial research",
    homepageUrl: "/library/sources",
    fetchMethod: "manual_search_index",
    notes:
      "Search/index URLs for under-documented entries. These keep pages in a visible research queue and are not direct evidence for hard historical claims.",
  },
];

type ResearchGapEntry = {
  brandSlug: string;
  brandZh: string;
  brandEn: string;
  modelSlug: string;
  modelName: string;
  modelId: string;
  seriesName: string;
  focus: string;
  sourceItemId: string;
  searchUrl: string;
  fillSystem?: string;
};

const REMAINING_GAP_ENTRIES: ResearchGapEntry[] = [
  {
    brandSlug: "yiren",
    brandZh: "依人",
    brandEn: "YiRen",
    modelSlug: "依人-yiren-878",
    modelName: "依人 YiRen 878",
    modelId: "yiren-878",
    seriesName: "878",
    focus: "878 型号来源、尺寸和笔尖规格",
    sourceItemId: "source-yiren-878-public-search",
    searchUrl:
      "https://www.bing.com/search?q=%22%E4%BE%9D%E4%BA%BA%22+%22878%22+%22%E9%92%A2%E7%AC%94%22",
  },
  {
    brandSlug: "banju",
    brandZh: "半句",
    brandEn: "BanJu",
    modelSlug: "半句",
    modelName: "半句 —",
    modelId: "banju-unspecified",
    seriesName: "待核验",
    focus: "品牌主体和具体型号名",
    sourceItemId: "source-banju-public-search",
    searchUrl:
      "https://www.bing.com/search?q=%22%E5%8D%8A%E5%8F%A5%22+%22%E9%92%A2%E7%AC%94%22",
  },
  {
    brandSlug: "tangyue",
    brandZh: "唐月",
    brandEn: "TangYue",
    modelSlug: "唐月-e5",
    modelName: "唐月 E5",
    modelId: "tangyue-e5",
    seriesName: "E5",
    focus: "E5 型号和百元钢笔社区讨论的来源边界",
    sourceItemId: "source-tangyue-e5-public-search",
    searchUrl:
      "https://www.bing.com/search?q=%22%E5%94%90%E6%9C%88%22+%22E5%22+%22%E9%92%A2%E7%AC%94%22",
  },
  {
    brandSlug: "saier",
    brandZh: "塞尔",
    brandEn: "Saier",
    modelSlug: "塞尔-3-0-ef尖",
    modelName: "塞尔 3.0 EF尖",
    modelId: "saier-3-0-ef",
    seriesName: "3.0 EF尖",
    focus: "EF 尖规格、版本和产品主体",
    sourceItemId: "source-saier-3-0-ef-public-search",
    searchUrl:
      "https://www.bing.com/search?q=%22%E5%A1%9E%E5%B0%94%22+%223.0%22+%22EF%E5%B0%96%22+%22%E9%92%A2%E7%AC%94%22",
  },
  {
    brandSlug: "dagong",
    brandZh: "大公",
    brandEn: "Dagong",
    modelSlug: "大公-dagong-56揿动式",
    modelName: "大公 Dagong 56揿动式",
    modelId: "dagong-56-click",
    seriesName: "56揿动式",
    focus: "揿动式结构、型号年代和上墨方式",
    sourceItemId: "source-dagong-56-click-public-search",
    searchUrl:
      "https://www.bing.com/search?q=%22%E5%A4%A7%E5%85%AC%22+%2256%22+%22%E6%8F%BF%E5%8A%A8%E5%BC%8F%22+%22%E9%92%A2%E7%AC%94%22",
    fillSystem: "揿动式/上墨方式待核验",
  },
  {
    brandSlug: "yisihua",
    brandZh: "意斯华",
    brandEn: "YiSiHua",
    modelSlug: "意斯华-p36",
    modelName: "意斯华 P36",
    modelId: "yisihua-p36",
    seriesName: "P36",
    focus: "P36 与末匠 V60 对比语境、规格和来源边界",
    sourceItemId: "source-yisihua-p36-public-search",
    searchUrl:
      "https://www.bing.com/search?q=%22%E6%84%8F%E6%96%AF%E5%8D%8E%22+%22P36%22+%22%E9%92%A2%E7%AC%94%22",
  },
  {
    brandSlug: "campus",
    brandZh: "欧领",
    brandEn: "Campus",
    modelSlug: "欧领-campus-校园系列",
    modelName: "欧领 Campus 校园系列",
    modelId: "campus-school-series",
    seriesName: "校园系列",
    focus: "校园系列定位、版本和品控口碑",
    sourceItemId: "source-campus-school-public-search",
    searchUrl:
      "https://www.bing.com/search?q=%22%E6%AC%A7%E9%A2%86%22+%22Campus%22+%22%E6%A0%A1%E5%9B%AD%E7%B3%BB%E5%88%97%22+%22%E9%92%A2%E7%AC%94%22",
  },
  {
    brandSlug: "yongxu",
    brandZh: "永续",
    brandEn: "YongXu",
    modelSlug: "永续",
    modelName: "永续 —",
    modelId: "yongxu-unspecified",
    seriesName: "待核验",
    focus: "品牌主体和具体型号名",
    sourceItemId: "source-yongxu-public-search",
    searchUrl:
      "https://www.bing.com/search?q=%22%E6%B0%B8%E7%BB%AD%22+%22%E9%92%A2%E7%AC%94%22",
  },
  {
    brandSlug: "paili",
    brandZh: "派利",
    brandEn: "Paili",
    modelSlug: "派利-002",
    modelName: "派利 002",
    modelId: "paili-002",
    seriesName: "002",
    focus: "002 型号来源、版本和规格",
    sourceItemId: "source-paili-002-public-search",
    searchUrl:
      "https://www.bing.com/search?q=%22%E6%B4%BE%E5%88%A9%22+%22002%22+%22%E9%92%A2%E7%AC%94%22",
  },
  {
    brandSlug: "lanbitou",
    brandZh: "烂笔头",
    brandEn: "Lanbitou",
    modelSlug: "烂笔头-lanbitou-3059",
    modelName: "烂笔头 Lanbitou 3059",
    modelId: "lanbitou-3059",
    seriesName: "3059",
    focus: "3059 入门型号定位、上墨方式和规格",
    sourceItemId: "source-lanbitou-3059-public-search",
    searchUrl:
      "https://www.bing.com/search?q=%22%E7%83%82%E7%AC%94%E5%A4%B4%22+%223059%22+%22%E9%92%A2%E7%AC%94%22",
    fillSystem: "墨囊/上墨器口径待核验",
  },
];

const SOURCE_ITEMS: SourceItemSeed[] = [
  {
    id: "source-douwan-official-overview",
    sourceId: "dareworks-official",
    title: "逗万 DareWorks: 品牌概述",
    url: "http://www.damiwonka.com/index.php?m=home&c=Lists&a=index&tid=1",
    itemType: "official_brand_page",
    author: "逗万 DareWorks",
    summary:
      "Official DouWan/DareWorks overview page used for brand positioning, 2022 brand-origin wording, and the relationship to Dongguan Simoo stationery context.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-douwan-liuguang-official",
    sourceId: "dareworks-official",
    title: "逗万 DareWorks: 流光系列产品文章",
    url: "http://www.damiwonka.com/index.php?a=index&aid=145&c=View&m=home",
    itemType: "official_product_article",
    author: "逗万 DareWorks",
    publishedAt: "2024-04-03",
    summary:
      "Official product article for DouWan Liuguang series. Used for color, brass body, surface process, and F nib marketing-spec context.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-lily-910-fpn-review",
    sourceId: "fountain-pen-network",
    title: "Fountain Pen Network: Annual Review 2019 - Lily 910",
    url: "https://www.fountainpennetwork.com/forum/topic/346545-annual-review-2019-lily-910/",
    itemType: "forum_review",
    author: "Fountain Pen Network contributors",
    publishedAt: "2019",
    summary:
      "Community review thread for Lily 910. Useful for identifying the model as a retractable Chinese fountain pen discussed by hobbyists.",
    allowedUse: "summary_only",
    reviewStatus: "needs_review",
  },
  {
    id: "source-admok-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Admok 简800",
    url: "https://www.bing.com/search?q=%22Admok%22+%22%E7%AE%80800%22+%22%E9%92%A2%E7%AC%94%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Public search index for the Admok 简800 entry. Use only to route manual verification and collect direct sources later.",
    allowedUse: "link_only",
    reviewStatus: "needs_review",
  },
  {
    id: "source-tramol-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Tramol 梵高系列",
    url: "https://www.bing.com/search?q=%22Tramol%22+%22%E6%A2%B5%E9%AB%98%22+%22%E9%92%A2%E7%AC%94%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Public search index for Tramol 梵高系列. Use only to locate direct product, retail, or review sources later.",
    allowedUse: "link_only",
    reviewStatus: "needs_review",
  },
  {
    id: "source-shanghai-1997-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: 上海 / 97 回归钢笔",
    url: "https://www.bing.com/search?q=%22%E4%B8%8A%E6%B5%B7%22+%2297%E5%9B%9E%E5%BD%92%22+%22%E9%92%A2%E7%AC%94%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Public search index for the Shanghai / 97 回归 entry. The current record may mix place, brand, and commemorative-model naming and must be split or verified later.",
    allowedUse: "link_only",
    reviewStatus: "needs_review",
  },
  {
    id: "source-dongwu-948-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: 东吴 948",
    url: "https://www.bing.com/search?q=%22%E4%B8%9C%E5%90%B4%22+%22948%22+%22%E9%92%A2%E7%AC%94%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Public search index for DongWu 948. Use only as a research queue until direct product or collector sources are attached.",
    allowedUse: "link_only",
    reviewStatus: "needs_review",
  },
  {
    id: "source-shule-2398-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: 书乐 2398",
    url: "https://www.bing.com/search?q=%22%E4%B9%A6%E4%B9%90%22+%222398%22+%22%E9%92%A2%E7%AC%94%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Public search index for ShuLe 2398. Use only to route future verification; do not use as standalone product evidence.",
    allowedUse: "link_only",
    reviewStatus: "needs_review",
  },
  {
    id: "source-hero-paddy-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: 英雄派迪 / 派迪一体尖",
    url: "https://www.bing.com/search?q=%22%E8%8B%B1%E9%9B%84%E6%B4%BE%E8%BF%AA%22+%22%E4%B8%80%E4%BD%93%E5%B0%96%22+%22%E9%92%A2%E7%AC%94%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Public search index for Hero Paddy / Paddy integrated-nib wording. Use to resolve whether current naming conflates brand, sub-brand, and nib style.",
    allowedUse: "link_only",
    reviewStatus: "needs_review",
  },
  {
    id: "source-jinxing-double-nib-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: 金星双尖钢笔",
    url: "https://www.bing.com/search?q=%22%E9%87%91%E6%98%9F%22+%22%E5%8F%8C%E5%B0%96%E9%92%A2%E7%AC%94%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Public search index for JinXing double-nib fountain pen references. Use only as a queue for direct collector or review sources.",
    allowedUse: "link_only",
    reviewStatus: "needs_review",
  },
  {
    id: "source-zhangjiang-988-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: 长江 988",
    url: "https://www.bing.com/search?q=%22%E9%95%BF%E6%B1%9F%22+%22988%22+%22%E9%92%A2%E7%AC%94%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Public search index for ZhangJiang 988. Use only to route manual source collection and name disambiguation.",
    allowedUse: "link_only",
    reviewStatus: "needs_review",
  },
  ...REMAINING_GAP_ENTRIES.map((entry) => ({
    id: entry.sourceItemId,
    sourceId: "public-web-research-index",
    title: `Research index: ${entry.modelName}`,
    url: entry.searchUrl,
    itemType: "research_index",
    author: "Project editorial research",
    summary: `Public search index for ${entry.modelName}. Use only to route manual source collection and name disambiguation.`,
    allowedUse: "link_only" as const,
    reviewStatus: "needs_review" as const,
  })),
];

function researchQueueStory(name: string, modelName: string, focus: string) {
  return [
    `${name} 现在先按“研究队列”处理，而不是强行写成完整品牌史。公开资料里能稳定看到的是站内已有的 ${modelName} 这条线索；品牌主体、生产年代、型号命名和与其他厂牌的关系仍需要继续核对。`,
    "",
    `后续整理时，优先找三类材料：第一是品牌或厂家页面，第二是带实物照片和参数的收藏/零售记录，第三是玩家长期评测。当前页面只把 ${focus} 作为阅读入口，避免把零散社区说法直接写成硬事实。`,
  ].join("\n");
}

function researchQueueModelStory(modelName: string, focus: string) {
  return [
    `${modelName} 的档案先放在“待核验型号”层级。这个页面的作用，是把已经出现在站内关系图里的型号留住，同时把缺口写清楚：年份、厂家、笔尖规格、上墨方式、尺寸重量和版本差异都还没有足够稳定的来源。`,
    "",
    `下一轮补证时，应优先找带图片和实测参数的资料，再把 ${focus} 拆成结构化 claims。现在的草稿不替代评测，只提供一个不会误导读者的索引入口。`,
  ].join("\n");
}

function makeResearchQueueBrand(entry: ResearchGapEntry): BrandSeed {
  return {
    slug: entry.brandSlug,
    aliases: [
      {
        alias: entry.brandZh,
        language: "zh",
        sourceId: "public-web-research-index",
      },
      {
        alias: entry.brandEn,
        language: "en",
        sourceId: "public-web-research-index",
      },
    ],
    sourceItemIds: [entry.sourceItemId],
    claims: [
      {
        id: `claim-${entry.brandSlug}-research-status`,
        predicate: "research_status",
        text: `${entry.brandZh} (${entry.brandEn}) currently has sparse direct source coverage in this library; keep brand history and model claims pending until direct sources are attached.`,
        sourceItemId: entry.sourceItemId,
        confidence: 0.32,
        reviewStatus: "needs_source",
      },
    ],
    story: {
      id: `story-brand-${entry.brandSlug}-research-gap`,
      title: `${entry.brandZh}先进入资料补证队列`,
      storyType: "brand_story",
      summary: `${entry.brandZh}页面先以${entry.modelName}为索引入口，标出品牌主体、型号参数和来源缺口。`,
      bodyMd: researchQueueStory(
        entry.brandZh,
        entry.modelName,
        entry.focus,
      ),
      status: "needs_sources",
      sourceNotes:
        "Research-index draft only. Replace with direct official, retail, collector, or review sources before publishing.",
      sourceItemIds: [entry.sourceItemId],
      claimIds: [`claim-${entry.brandSlug}-research-status`],
    },
    timeline: {
      id: `event-${entry.brandSlug}-research-queue-2026-06-25`,
      title: "站内研究队列建立",
      eventType: "community_event",
      startDate: "2026-06-25",
      description: `Editorial queue item marking ${entry.brandZh} as an under-documented brand needing direct source collection; not a brand-history event.`,
      sourceItemId: entry.sourceItemId,
      reviewStatus: "needs_source",
    },
  };
}

function makeResearchQueueModel(entry: ResearchGapEntry): ModelSeed {
  return {
    slug: entry.modelSlug,
    brandSlug: entry.brandSlug,
    aliases: [
      {
        alias: entry.modelName,
        language: "zh",
        sourceId: "public-web-research-index",
      },
      {
        alias: `${entry.brandEn} ${entry.seriesName}`,
        language: "en",
        sourceId: "public-web-research-index",
      },
    ],
    sourceItemIds: [entry.sourceItemId],
    spec: {
      id: `spec-${entry.modelId}`,
      seriesName: entry.seriesName,
      releaseYear: "待核验",
      originCountry: "中国",
      nib: "钢尖/规格待核验",
      fillSystem: entry.fillSystem || "待核验",
      material: "待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "待核验",
      status: "待核验",
      reviewStatus: "needs_source",
    },
    story: {
      id: `story-model-${entry.modelId}-research-gap`,
      title: `${entry.seriesName}先作为待核验型号保留`,
      storyType: "model_story",
      summary: `${entry.modelName}页面先保留型号入口，等待直接来源补齐参数。`,
      bodyMd: researchQueueModelStory(entry.modelName, entry.focus),
      status: "needs_sources",
      sourceNotes:
        "Research-index draft only. Direct sources are still required before publication.",
      sourceItemIds: [entry.sourceItemId],
      claimIds: [`claim-${entry.modelId}-research-status`],
    },
    claims: [
      {
        id: `claim-${entry.modelId}-research-status`,
        predicate: "research_status",
        text: `${entry.modelName} remains a research-queue model until direct sources verify specifications and production context.`,
        sourceItemId: entry.sourceItemId,
        confidence: 0.32,
        reviewStatus: "needs_source",
      },
    ],
  };
}

const BRANDS: BrandSeed[] = [
  {
    slug: "douwan",
    aliases: [
      { alias: "逗万", language: "zh", sourceId: "dareworks-official" },
      { alias: "DouWan", language: "en", sourceId: "dareworks-official" },
      { alias: "DareWorks", language: "en", sourceId: "dareworks-official" },
    ],
    sourceItemIds: ["source-douwan-official-overview", "source-douwan-liuguang-official"],
    claims: [
      {
        id: "claim-douwan-official-brand-anchor",
        predicate: "official_brand_anchor",
        text:
          "DouWan/DareWorks official material frames 逗万 as a creative stationery brand established in 2022 within Dongguan Simoo's stationery context.",
        sourceItemId: "source-douwan-official-overview",
        evidenceLocator: "品牌概述 / 品牌故事",
        confidence: 0.72,
        reviewStatus: "pending",
      },
    ],
    story: {
      id: "story-brand-douwan-research-gap",
      title: "先把逗万放进现代文创钢笔语境",
      storyType: "brand_story",
      summary:
        "逗万页面先以官网品牌概述和流光系列产品文章为锚点，把它放进现代文创、礼品和设计型书写工具的语境里。",
      bodyMd:
        "逗万不适合被写成传统老牌钢笔厂。官网材料更像是一个现代文创品牌的入口：强调创意、趣味、结构重组和实用主义，同时把流光、妙笔、卓越等系列放在产品中心里。\n\n在图书馆里，逗万可以先走两条线：一条是品牌如何把文创、礼品和书写工具结合；另一条是流光系列这类传统笔产品如何把颜色、金属笔身和 F 尖作为卖点。后续仍需要补充非官方评测，才能判断真实书写体验、耐用性和价格段。",
      status: "draft",
      sourceNotes:
        "Draft based on DouWan/DareWorks official overview and official Liuguang product article. Treat wording as official marketing until independent reviews are added.",
      sourceItemIds: ["source-douwan-official-overview", "source-douwan-liuguang-official"],
      claimIds: ["claim-douwan-official-brand-anchor"],
    },
    timeline: {
      id: "event-douwan-2022-brand-origin",
      title: "逗万品牌设立口径",
      eventType: "brand_founded",
      startDate: "2022",
      description:
        "DouWan official overview presents 2022 as the moment when Dongguan Simoo set up 逗万 as its own creative stationery brand.",
      sourceItemId: "source-douwan-official-overview",
      reviewStatus: "pending",
    },
    externalIds: [
      {
        provider: "official_site",
        externalId: "damiwonka",
        url: "http://www.damiwonka.com/",
      },
    ],
  },
  {
    slug: "lily",
    aliases: [
      { alias: "铃兰", language: "zh", sourceId: "fountain-pen-network" },
      { alias: "Lily", language: "en", sourceId: "fountain-pen-network" },
      { alias: "Lily 910", language: "en", sourceId: "fountain-pen-network" },
    ],
    sourceItemIds: ["source-lily-910-fpn-review"],
    claims: [
      {
        id: "claim-lily-910-community-anchor",
        predicate: "community_model_anchor",
        text:
          "The Lily 910 is visible in community fountain-pen discussion as a Chinese retractable fountain pen, but brand history and production details still need direct sources.",
        sourceItemId: "source-lily-910-fpn-review",
        evidenceLocator: "Annual Review 2019 - Lily 910",
        confidence: 0.56,
        reviewStatus: "pending",
      },
    ],
    story: {
      id: "story-brand-lily-research-gap",
      title: "从 Lily 910 反推铃兰条目的资料缺口",
      storyType: "brand_story",
      summary:
        "铃兰页面先以 Lily 910 的社区评测作为入口，明确区分可见型号和仍待核验的品牌历史。",
      bodyMd: researchQueueStory("铃兰", "Lily 910", "按动伸缩钢笔"),
      status: "needs_sources",
      sourceNotes:
        "Draft uses Fountain Pen Network as a community anchor. Manufacturer, release date, and production context require direct sources.",
      sourceItemIds: ["source-lily-910-fpn-review"],
      claimIds: ["claim-lily-910-community-anchor"],
    },
    timeline: {
      id: "event-lily-910-community-review-2019",
      title: "Lily 910 社区评测进入资料队列",
      eventType: "community_event",
      startDate: "2019",
      circa: true,
      description:
        "A Fountain Pen Network review thread gives the site a community anchor for Lily 910; this is not a brand founding date.",
      sourceItemId: "source-lily-910-fpn-review",
      reviewStatus: "pending",
    },
  },
  {
    slug: "admok",
    aliases: [
      { alias: "Admok", language: "en", sourceId: "public-web-research-index" },
      { alias: "简800", language: "zh", sourceId: "public-web-research-index" },
    ],
    sourceItemIds: ["source-admok-public-search"],
    claims: [
      {
        id: "claim-admok-research-status",
        predicate: "research_status",
        text:
          "Admok currently has sparse public source coverage in this library; treat brand history and model claims as pending until direct sources are attached.",
        sourceItemId: "source-admok-public-search",
        confidence: 0.35,
        reviewStatus: "needs_source",
      },
    ],
    story: {
      id: "story-brand-admok-research-gap",
      title: "Admok 先进入资料补证队列",
      storyType: "brand_story",
      summary:
        "Admok 页面先以简800为索引入口，标出品牌主体、型号参数和来源缺口。",
      bodyMd: researchQueueStory("Admok", "简800", "简800这个型号名"),
      status: "needs_sources",
      sourceNotes:
        "Research-index draft only. Replace with direct official, retail, or review sources before publishing.",
      sourceItemIds: ["source-admok-public-search"],
      claimIds: ["claim-admok-research-status"],
    },
    timeline: {
      id: "event-admok-research-queue-2026-06-25",
      title: "站内研究队列建立",
      eventType: "community_event",
      startDate: "2026-06-25",
      description:
        "Editorial queue item marking Admok as an under-documented brand needing direct source collection; not a brand-history event.",
      sourceItemId: "source-admok-public-search",
      reviewStatus: "needs_source",
    },
  },
  {
    slug: "tramol",
    aliases: [
      { alias: "Tramol", language: "en", sourceId: "public-web-research-index" },
      { alias: "梵高系列", language: "zh", sourceId: "public-web-research-index" },
    ],
    sourceItemIds: ["source-tramol-public-search"],
    claims: [
      {
        id: "claim-tramol-research-status",
        predicate: "research_status",
        text:
          "Tramol's Van Gogh-related fountain-pen references need direct product or review sources before the library treats series details as facts.",
        sourceItemId: "source-tramol-public-search",
        confidence: 0.35,
        reviewStatus: "needs_source",
      },
    ],
    story: {
      id: "story-brand-tramol-research-gap",
      title: "Tramol 先按艺术主题型号补证",
      storyType: "brand_story",
      summary:
        "Tramol 页面先围绕梵高系列建立研究入口，避免把艺术主题包装直接写成品牌史。",
      bodyMd: researchQueueStory("Tramol", "梵高系列", "艺术主题与梵高系列命名"),
      status: "needs_sources",
      sourceNotes:
        "Research-index draft only. Direct product pages and independent reviews are still required.",
      sourceItemIds: ["source-tramol-public-search"],
      claimIds: ["claim-tramol-research-status"],
    },
    timeline: {
      id: "event-tramol-research-queue-2026-06-25",
      title: "站内研究队列建立",
      eventType: "community_event",
      startDate: "2026-06-25",
      description:
        "Editorial queue item for Tramol and its Van Gogh-series references; not a brand-history event.",
      sourceItemId: "source-tramol-public-search",
      reviewStatus: "needs_source",
    },
  },
  {
    slug: "shanghai",
    aliases: [
      { alias: "上海", language: "zh", sourceId: "public-web-research-index" },
      { alias: "ShangHai", language: "en", sourceId: "public-web-research-index" },
    ],
    sourceItemIds: ["source-shanghai-1997-public-search"],
    claims: [
      {
        id: "claim-shanghai-1997-research-status",
        predicate: "disambiguation_needed",
        text:
          "The current Shanghai / 97 回归 record may mix a place or brand label with a commemorative model theme, so it should be treated as a disambiguation task.",
        sourceItemId: "source-shanghai-1997-public-search",
        confidence: 0.32,
        reviewStatus: "needs_source",
      },
    ],
    story: {
      id: "story-brand-shanghai-research-gap",
      title: "先把“上海 / 97 回归”拆成待核验线索",
      storyType: "brand_story",
      summary:
        "上海页面当前更像品牌名、地名和纪念型号混在一起的资料入口，后续需要拆分或重命名。",
      bodyMd:
        "这个条目暂时不应该写成确定的品牌史。站内现在同时出现“上海”品牌页和“97 回归”型号页，但公开检索容易把上海地名、英雄等上海制笔体系和香港回归纪念款混在一起。\n\n因此当前页面先承担一个整理任务：保留这条线索，同时提醒后续核对者优先确认实体边界。下一步要判断它究竟是独立品牌、某厂牌下的纪念型号，还是应该并入 Hero/上海制笔体系的具体型号档案。",
      status: "needs_sources",
      sourceNotes:
        "Research-index draft only. The entity likely needs disambiguation before factual expansion.",
      sourceItemIds: ["source-shanghai-1997-public-search"],
      claimIds: ["claim-shanghai-1997-research-status"],
    },
    timeline: {
      id: "event-shanghai-research-queue-2026-06-25",
      title: "站内研究队列建立",
      eventType: "community_event",
      startDate: "2026-06-25",
      description:
        "Editorial disambiguation queue item for Shanghai / 97 回归; not a brand-history event.",
      sourceItemId: "source-shanghai-1997-public-search",
      reviewStatus: "needs_source",
    },
  },
  {
    slug: "dongwu",
    aliases: [
      { alias: "东吴", language: "zh", sourceId: "public-web-research-index" },
      { alias: "DongWu", language: "en", sourceId: "public-web-research-index" },
    ],
    sourceItemIds: ["source-dongwu-948-public-search"],
    claims: [
      {
        id: "claim-dongwu-research-status",
        predicate: "research_status",
        text:
          "DongWu 948 has a site entry but still lacks direct, stable sources for brand history and model specifications.",
        sourceItemId: "source-dongwu-948-public-search",
        confidence: 0.34,
        reviewStatus: "needs_source",
      },
    ],
    story: {
      id: "story-brand-dongwu-research-gap",
      title: "东吴先从 948 型号补证",
      storyType: "brand_story",
      summary:
        "东吴页面先围绕 948 建立研究入口，后续再核对品牌主体和型号参数。",
      bodyMd: researchQueueStory("东吴", "DongWu 948", "948型号名"),
      status: "needs_sources",
      sourceNotes: "Research-index draft only; direct sources are still required.",
      sourceItemIds: ["source-dongwu-948-public-search"],
      claimIds: ["claim-dongwu-research-status"],
    },
    timeline: {
      id: "event-dongwu-research-queue-2026-06-25",
      title: "站内研究队列建立",
      eventType: "community_event",
      startDate: "2026-06-25",
      description:
        "Editorial queue item for DongWu 948 source collection; not a brand-history event.",
      sourceItemId: "source-dongwu-948-public-search",
      reviewStatus: "needs_source",
    },
  },
  {
    slug: "shule",
    aliases: [
      { alias: "书乐", language: "zh", sourceId: "public-web-research-index" },
      { alias: "ShuLe", language: "en", sourceId: "public-web-research-index" },
    ],
    sourceItemIds: ["source-shule-2398-public-search"],
    claims: [
      {
        id: "claim-shule-research-status",
        predicate: "research_status",
        text:
          "ShuLe 2398 is retained as a model clue, but the brand page still needs direct sources before historical claims are made.",
        sourceItemId: "source-shule-2398-public-search",
        confidence: 0.34,
        reviewStatus: "needs_source",
      },
    ],
    story: {
      id: "story-brand-shule-research-gap",
      title: "书乐先保留 2398 型号索引",
      storyType: "brand_story",
      summary:
        "书乐页面先以 2398 为索引入口，后续补品牌主体、产地和型号实物资料。",
      bodyMd: researchQueueStory("书乐", "ShuLe 2398", "2398型号名"),
      status: "needs_sources",
      sourceNotes: "Research-index draft only; direct sources are still required.",
      sourceItemIds: ["source-shule-2398-public-search"],
      claimIds: ["claim-shule-research-status"],
    },
    timeline: {
      id: "event-shule-research-queue-2026-06-25",
      title: "站内研究队列建立",
      eventType: "community_event",
      startDate: "2026-06-25",
      description:
        "Editorial queue item for ShuLe 2398 source collection; not a brand-history event.",
      sourceItemId: "source-shule-2398-public-search",
      reviewStatus: "needs_source",
    },
  },
  {
    slug: "hero-paddy",
    aliases: [
      { alias: "英雄派迪", language: "zh", sourceId: "public-web-research-index" },
      { alias: "Hero Paddy", language: "en", sourceId: "public-web-research-index" },
      { alias: "派迪", language: "zh", sourceId: "public-web-research-index" },
    ],
    sourceItemIds: ["source-hero-paddy-public-search"],
    claims: [
      {
        id: "claim-hero-paddy-disambiguation-status",
        predicate: "disambiguation_needed",
        text:
          "Hero Paddy / Paddy integrated-nib wording needs disambiguation; the current page should not yet assert a stable sub-brand relationship without a direct source.",
        sourceItemId: "source-hero-paddy-public-search",
        confidence: 0.3,
        reviewStatus: "needs_source",
      },
    ],
    story: {
      id: "story-brand-hero-paddy-research-gap",
      title: "英雄派迪先处理命名和从属关系",
      storyType: "brand_story",
      summary:
        "英雄派迪页面先把“英雄”“派迪”和“一体尖”之间的关系作为待核验问题列出来。",
      bodyMd:
        "这个条目的主要问题不是缺少漂亮文案，而是命名边界还不稳。站内目前把它写成“英雄派迪”，但公开资料检索里容易同时出现 Hero、派迪、派迪世纪和一体尖等不同说法。\n\n所以这页先不继续扩写品牌史。后续应优先找官方或包装实物证据，确认派迪是否为英雄旗下品牌、具体型号是否应独立建档，以及“一体尖”究竟是型号名、笔尖结构还是玩家简称。",
      status: "needs_sources",
      sourceNotes:
        "Research-index draft only. Do not publish sub-brand claims until direct evidence is attached.",
      sourceItemIds: ["source-hero-paddy-public-search"],
      claimIds: ["claim-hero-paddy-disambiguation-status"],
    },
    timeline: {
      id: "event-hero-paddy-research-queue-2026-06-25",
      title: "站内研究队列建立",
      eventType: "community_event",
      startDate: "2026-06-25",
      description:
        "Editorial disambiguation queue item for Hero Paddy / Paddy integrated-nib wording; not a brand-history event.",
      sourceItemId: "source-hero-paddy-public-search",
      reviewStatus: "needs_source",
    },
  },
  {
    slug: "jinxing",
    aliases: [
      { alias: "金星", language: "zh", sourceId: "public-web-research-index" },
      { alias: "JinXing", language: "en", sourceId: "public-web-research-index" },
      { alias: "Golden Star", language: "en", sourceId: "public-web-research-index" },
    ],
    sourceItemIds: ["source-jinxing-double-nib-public-search"],
    claims: [
      {
        id: "claim-jinxing-double-nib-research-status",
        predicate: "research_status",
        text:
          "JinXing double-nib references need direct collector or product sources before the library treats the double-nib feature as a verified brand signature.",
        sourceItemId: "source-jinxing-double-nib-public-search",
        confidence: 0.34,
        reviewStatus: "needs_source",
      },
    ],
    story: {
      id: "story-brand-jinxing-research-gap",
      title: "金星先围绕双尖线索补证",
      storyType: "brand_story",
      summary:
        "金星页面先保留双尖钢笔线索，后续补收藏资料、实物图和型号年代。",
      bodyMd: researchQueueStory("金星", "JinXing 双尖钢笔", "双尖结构"),
      status: "needs_sources",
      sourceNotes: "Research-index draft only; direct sources are still required.",
      sourceItemIds: ["source-jinxing-double-nib-public-search"],
      claimIds: ["claim-jinxing-double-nib-research-status"],
    },
    timeline: {
      id: "event-jinxing-research-queue-2026-06-25",
      title: "站内研究队列建立",
      eventType: "community_event",
      startDate: "2026-06-25",
      description:
        "Editorial queue item for JinXing double-nib source collection; not a brand-history event.",
      sourceItemId: "source-jinxing-double-nib-public-search",
      reviewStatus: "needs_source",
    },
  },
  {
    slug: "zhangjiang",
    aliases: [
      { alias: "长江", language: "zh", sourceId: "public-web-research-index" },
      { alias: "ZhangJiang", language: "en", sourceId: "public-web-research-index" },
      { alias: "Changjiang", language: "en", sourceId: "public-web-research-index" },
    ],
    sourceItemIds: ["source-zhangjiang-988-public-search"],
    claims: [
      {
        id: "claim-zhangjiang-research-status",
        predicate: "research_status",
        text:
          "ZhangJiang 988 currently has insufficient direct source coverage; keep brand history and model specifications pending.",
        sourceItemId: "source-zhangjiang-988-public-search",
        confidence: 0.33,
        reviewStatus: "needs_source",
      },
    ],
    story: {
      id: "story-brand-zhangjiang-research-gap",
      title: "长江先保留 988 型号索引",
      storyType: "brand_story",
      summary:
        "长江页面先以 988 为索引入口，后续核对品牌主体、产地和版本差异。",
      bodyMd: researchQueueStory("长江", "ZhangJiang 988", "988型号名"),
      status: "needs_sources",
      sourceNotes: "Research-index draft only; direct sources are still required.",
      sourceItemIds: ["source-zhangjiang-988-public-search"],
      claimIds: ["claim-zhangjiang-research-status"],
    },
    timeline: {
      id: "event-zhangjiang-research-queue-2026-06-25",
      title: "站内研究队列建立",
      eventType: "community_event",
      startDate: "2026-06-25",
      description:
        "Editorial queue item for ZhangJiang 988 source collection; not a brand-history event.",
      sourceItemId: "source-zhangjiang-988-public-search",
      reviewStatus: "needs_source",
    },
  },
  ...REMAINING_GAP_ENTRIES.map(makeResearchQueueBrand),
];

const MODELS: ModelSeed[] = [
  {
    slug: "逗万-流光系列",
    brandSlug: "douwan",
    aliases: [
      { alias: "流光系列", language: "zh", sourceId: "dareworks-official" },
      { alias: "DouWan Liuguang", language: "en", sourceId: "dareworks-official" },
    ],
    sourceItemIds: ["source-douwan-liuguang-official"],
    spec: {
      id: "spec-douwan-liuguang",
      seriesName: "流光系列",
      releaseYear: "2024 官方产品文章发布",
      originCountry: "中国",
      nib: "铱金 F 尖（官方产品文章口径）",
      fillSystem: "待核验",
      material: "纯铜笔身、烤漆与 PVD 灰铬工艺（官方产品文章口径）",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "待核验",
      status: "在售/供应状态需复核",
      reviewStatus: "pending",
    },
    story: {
      id: "story-model-douwan-liuguang-research-gap",
      title: "把流光系列先做成可核验的现代产品档案",
      storyType: "model_story",
      summary:
        "流光系列档案先记录官网能支撑的材料、颜色和 F 尖信息，真实书写体验等待独立评测补充。",
      bodyMd:
        "逗万流光系列可以先作为现代文创钢笔/签字笔产品来读。官方产品文章给出的可用信息主要集中在外观和材料：多种配色、纯铜笔身、表面工艺和 F 尖描述。这些信息适合放进型号档案，但它们仍是品牌自己的产品口径。\n\n下一步需要补玩家实测：重量、握持重心、笔尖顺滑度、上墨兼容性、镀层耐磨和长期使用反馈。现在的页面先把可溯源字段整理出来，避免空页面，也避免把营销话术直接写成评测结论。",
      status: "draft",
      sourceNotes:
        "Draft based on official DouWan Liuguang product article. Independent review evidence remains missing.",
      sourceItemIds: ["source-douwan-liuguang-official"],
      claimIds: [
        "claim-douwan-liuguang-official-material",
        "claim-douwan-liuguang-official-nib",
      ],
    },
    claims: [
      {
        id: "claim-douwan-liuguang-official-material",
        predicate: "material",
        text:
          "The official DouWan Liuguang article describes a brass body with painted finish and PVD gray-chrome process.",
        sourceItemId: "source-douwan-liuguang-official",
        evidenceLocator: "纯铜笔身 / PVD灰铬工艺",
        confidence: 0.72,
        reviewStatus: "pending",
      },
      {
        id: "claim-douwan-liuguang-official-nib",
        predicate: "nib",
        text:
          "The official DouWan Liuguang article describes an iridium F nib for the fountain-pen/signature-pen product context.",
        sourceItemId: "source-douwan-liuguang-official",
        evidenceLocator: "铱金笔尖 / F尖",
        confidence: 0.72,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-douwan-liuguang-colorways",
        name: "官网四色口径",
        notes:
          "官方产品文章列出黎雾灰、晚霞棕、墨影绿、夜幕蓝四种颜色；供应状态和地区版本待复核。",
        sourceItemId: "source-douwan-liuguang-official",
        reviewStatus: "pending",
      },
    ],
    timeline: {
      id: "event-douwan-liuguang-product-article-2024-04-03",
      title: "流光系列官方产品文章发布",
      eventType: "design_milestone",
      startDate: "2024-04-03",
      description:
        "DouWan official site published a Liuguang product article with material, color, and nib marketing details.",
      sourceItemId: "source-douwan-liuguang-official",
      reviewStatus: "pending",
    },
  },
  {
    slug: "铃兰-lily-910-capless",
    brandSlug: "lily",
    aliases: [
      { alias: "Lily 910", language: "en", sourceId: "fountain-pen-network" },
      { alias: "铃兰 910", language: "zh", sourceId: "fountain-pen-network" },
    ],
    sourceItemIds: ["source-lily-910-fpn-review"],
    spec: {
      id: "spec-lily-910",
      seriesName: "910",
      releaseYear: "待核验",
      originCountry: "中国",
      nib: "钢尖/规格待核验",
      fillSystem: "按动伸缩机构；上墨方式待核验",
      material: "待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "中古/收藏市场价格需复核",
      status: "停产或流通状态待核验",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-lily-910-research-gap",
      title: "把 Lily 910 作为国产按动钢笔线索处理",
      storyType: "model_story",
      summary:
        "Lily 910 页面先以社区评测为锚点，后续补厂家、年代和机构细节。",
      bodyMd: researchQueueModelStory("Lily 910", "按动伸缩机构、笔尖规格和上墨方式"),
      status: "needs_sources",
      sourceNotes:
        "Community review anchor only. Direct product, catalog, or collector sources are required for publication.",
      sourceItemIds: ["source-lily-910-fpn-review"],
      claimIds: ["claim-lily-910-community-model-anchor"],
    },
    claims: [
      {
        id: "claim-lily-910-community-model-anchor",
        predicate: "community_model_anchor",
        text:
          "Fountain Pen Network discussion gives Lily 910 a community-review anchor as a retractable Chinese fountain pen, while technical details remain pending.",
        sourceItemId: "source-lily-910-fpn-review",
        evidenceLocator: "Annual Review 2019 - Lily 910",
        confidence: 0.55,
        reviewStatus: "pending",
      },
    ],
    timeline: {
      id: "event-lily-910-community-review-2019-model",
      title: "Lily 910 社区评测进入型号档案",
      eventType: "community_event",
      startDate: "2019",
      circa: true,
      description:
        "Fountain Pen Network provides a community review anchor for this model; this is not a release date.",
      sourceItemId: "source-lily-910-fpn-review",
      reviewStatus: "pending",
    },
  },
  {
    slug: "admok-简800",
    brandSlug: "admok",
    aliases: [
      { alias: "Admok 简800", language: "zh", sourceId: "public-web-research-index" },
      { alias: "Admok Jian 800", language: "en", sourceId: "public-web-research-index" },
    ],
    sourceItemIds: ["source-admok-public-search"],
    spec: {
      id: "spec-admok-jian-800",
      seriesName: "简800",
      releaseYear: "待核验",
      originCountry: "中国",
      nib: "钢尖/规格待核验",
      fillSystem: "待核验",
      material: "待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "待核验",
      status: "待核验",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-admok-jian-800-research-gap",
      title: "简800 先作为待核验型号保留",
      storyType: "model_story",
      summary: "Admok 简800 页面先保留型号入口，等待直接来源补齐参数。",
      bodyMd: researchQueueModelStory("Admok 简800", "简800的型号来源和规格"),
      status: "needs_sources",
      sourceNotes: "Research-index draft only; direct sources are still required.",
      sourceItemIds: ["source-admok-public-search"],
      claimIds: ["claim-admok-jian-800-research-status"],
    },
    claims: [
      {
        id: "claim-admok-jian-800-research-status",
        predicate: "research_status",
        text:
          "Admok 简800 remains a research-queue model until direct product, review, or retail sources verify specifications.",
        sourceItemId: "source-admok-public-search",
        confidence: 0.32,
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "tramol-梵高系列",
    brandSlug: "tramol",
    aliases: [
      { alias: "Tramol 梵高系列", language: "zh", sourceId: "public-web-research-index" },
      { alias: "Tramol Van Gogh Series", language: "en", sourceId: "public-web-research-index" },
    ],
    sourceItemIds: ["source-tramol-public-search"],
    spec: {
      id: "spec-tramol-van-gogh-series",
      seriesName: "梵高系列",
      releaseYear: "待核验",
      originCountry: "中国",
      nib: "钢尖/规格待核验",
      fillSystem: "墨囊/上墨器口径待核验",
      material: "待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "待核验",
      status: "待核验",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-tramol-van-gogh-research-gap",
      title: "梵高系列先作为艺术主题型号补证",
      storyType: "model_story",
      summary:
        "Tramol 梵高系列页面先保留艺术主题线索，等待产品页和评测核验。",
      bodyMd: researchQueueModelStory("Tramol 梵高系列", "艺术主题包装、笔尖和上墨规格"),
      status: "needs_sources",
      sourceNotes: "Research-index draft only; direct sources are still required.",
      sourceItemIds: ["source-tramol-public-search"],
      claimIds: ["claim-tramol-van-gogh-research-status"],
    },
    claims: [
      {
        id: "claim-tramol-van-gogh-research-status",
        predicate: "research_status",
        text:
          "Tramol 梵高系列 needs direct product or review sources before art-theme and specification claims are treated as verified.",
        sourceItemId: "source-tramol-public-search",
        confidence: 0.32,
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "上海-shanghai-97回归",
    brandSlug: "shanghai",
    aliases: [
      { alias: "上海 97回归", language: "zh", sourceId: "public-web-research-index" },
      { alias: "ShangHai 97 Handover", language: "en", sourceId: "public-web-research-index" },
    ],
    sourceItemIds: ["source-shanghai-1997-public-search"],
    spec: {
      id: "spec-shanghai-1997-handover",
      seriesName: "97回归",
      releaseYear: "1997 主题待核验",
      originCountry: "中国",
      nib: "钢尖/口径待核验",
      fillSystem: "待核验",
      material: "待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "收藏/纪念市场价格需复核",
      status: "待拆分或重命名",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-shanghai-1997-research-gap",
      title: "97 回归先作为纪念主题线索处理",
      storyType: "model_story",
      summary:
        "上海 97回归页面当前先做命名核验，不把品牌归属写死。",
      bodyMd:
        "这个型号档案的核心问题是归属：它可能是独立品牌线索，也可能是上海制笔体系、英雄相关纪念款或收藏市场命名混合而成。现阶段不适合继续扩写外观和历史故事。\n\n下一步应先找包装、笔帽刻字、目录或可靠收藏记录，确认“上海”“97 回归”和具体厂牌之间的关系。确认之前，页面只保留为纪念主题索引。",
      status: "needs_sources",
      sourceNotes: "Research-index draft only; entity disambiguation required.",
      sourceItemIds: ["source-shanghai-1997-public-search"],
      claimIds: ["claim-shanghai-1997-model-disambiguation"],
    },
    claims: [
      {
        id: "claim-shanghai-1997-model-disambiguation",
        predicate: "disambiguation_needed",
        text:
          "Shanghai 97 回归 needs entity disambiguation before brand attribution, release history, or specification claims are made.",
        sourceItemId: "source-shanghai-1997-public-search",
        confidence: 0.3,
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "东吴-dongwu-948",
    brandSlug: "dongwu",
    aliases: [
      { alias: "东吴 948", language: "zh", sourceId: "public-web-research-index" },
      { alias: "DongWu 948", language: "en", sourceId: "public-web-research-index" },
    ],
    sourceItemIds: ["source-dongwu-948-public-search"],
    spec: {
      id: "spec-dongwu-948",
      seriesName: "948",
      releaseYear: "待核验",
      originCountry: "中国",
      nib: "钢尖/规格待核验",
      fillSystem: "待核验",
      material: "待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "待核验",
      status: "待核验",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-dongwu-948-research-gap",
      title: "948 先作为东吴型号索引",
      storyType: "model_story",
      summary:
        "东吴 948 页面先保留型号入口，等待直接来源补齐参数。",
      bodyMd: researchQueueModelStory("东吴 DongWu 948", "948型号来源和规格"),
      status: "needs_sources",
      sourceNotes: "Research-index draft only; direct sources are still required.",
      sourceItemIds: ["source-dongwu-948-public-search"],
      claimIds: ["claim-dongwu-948-research-status"],
    },
    claims: [
      {
        id: "claim-dongwu-948-research-status",
        predicate: "research_status",
        text:
          "DongWu 948 remains a research-queue model until direct sources verify specifications and production context.",
        sourceItemId: "source-dongwu-948-public-search",
        confidence: 0.32,
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "书乐-shule-2398",
    brandSlug: "shule",
    aliases: [
      { alias: "书乐 2398", language: "zh", sourceId: "public-web-research-index" },
      { alias: "ShuLe 2398", language: "en", sourceId: "public-web-research-index" },
    ],
    sourceItemIds: ["source-shule-2398-public-search"],
    spec: {
      id: "spec-shule-2398",
      seriesName: "2398",
      releaseYear: "待核验",
      originCountry: "中国",
      nib: "钢尖/规格待核验",
      fillSystem: "待核验",
      material: "待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "待核验",
      status: "待核验",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-shule-2398-research-gap",
      title: "2398 先作为书乐型号索引",
      storyType: "model_story",
      summary:
        "书乐 2398 页面先保留型号入口，等待直接来源补齐参数。",
      bodyMd: researchQueueModelStory("书乐 ShuLe 2398", "2398型号来源和规格"),
      status: "needs_sources",
      sourceNotes: "Research-index draft only; direct sources are still required.",
      sourceItemIds: ["source-shule-2398-public-search"],
      claimIds: ["claim-shule-2398-research-status"],
    },
    claims: [
      {
        id: "claim-shule-2398-research-status",
        predicate: "research_status",
        text:
          "ShuLe 2398 remains a research-queue model until direct sources verify specifications and production context.",
        sourceItemId: "source-shule-2398-public-search",
        confidence: 0.32,
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "英雄派迪-一体尖",
    brandSlug: "hero-paddy",
    aliases: [
      { alias: "英雄派迪 一体尖", language: "zh", sourceId: "public-web-research-index" },
      { alias: "Hero Paddy integrated nib", language: "en", sourceId: "public-web-research-index" },
    ],
    sourceItemIds: ["source-hero-paddy-public-search"],
    spec: {
      id: "spec-hero-paddy-integrated-nib",
      seriesName: "一体尖",
      releaseYear: "待核验",
      originCountry: "中国",
      nib: "一体尖口径待核验",
      fillSystem: "待核验",
      material: "待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "待核验",
      status: "待核验/需先确认命名边界",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-hero-paddy-integrated-nib-research-gap",
      title: "一体尖先作为命名核验入口",
      storyType: "model_story",
      summary:
        "英雄派迪一体尖页面先处理品牌、型号和笔尖结构之间的边界。",
      bodyMd: researchQueueModelStory("英雄派迪 一体尖", "品牌归属、一体尖结构和型号命名"),
      status: "needs_sources",
      sourceNotes: "Research-index draft only; disambiguation is required before publication.",
      sourceItemIds: ["source-hero-paddy-public-search"],
      claimIds: ["claim-hero-paddy-integrated-nib-research-status"],
    },
    claims: [
      {
        id: "claim-hero-paddy-integrated-nib-research-status",
        predicate: "disambiguation_needed",
        text:
          "Hero Paddy integrated-nib wording needs direct evidence before the library treats it as a verified model or sub-brand entry.",
        sourceItemId: "source-hero-paddy-public-search",
        confidence: 0.3,
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "金星-jinxing-双尖钢笔",
    brandSlug: "jinxing",
    aliases: [
      { alias: "金星双尖钢笔", language: "zh", sourceId: "public-web-research-index" },
      { alias: "JinXing double-nib fountain pen", language: "en", sourceId: "public-web-research-index" },
    ],
    sourceItemIds: ["source-jinxing-double-nib-public-search"],
    spec: {
      id: "spec-jinxing-double-nib",
      seriesName: "双尖钢笔",
      releaseYear: "待核验",
      originCountry: "中国",
      nib: "双尖结构待核验",
      fillSystem: "待核验",
      material: "待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "收藏市场价格需复核",
      status: "待核验",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-jinxing-double-nib-research-gap",
      title: "双尖钢笔先作为结构线索",
      storyType: "model_story",
      summary:
        "金星双尖钢笔页面先保留结构线索，后续补实物资料和年代。",
      bodyMd: researchQueueModelStory("金星 JinXing 双尖钢笔", "双尖结构、生产年代和实物规格"),
      status: "needs_sources",
      sourceNotes: "Research-index draft only; direct collector or product sources are required.",
      sourceItemIds: ["source-jinxing-double-nib-public-search"],
      claimIds: ["claim-jinxing-double-nib-model-research-status"],
    },
    claims: [
      {
        id: "claim-jinxing-double-nib-model-research-status",
        predicate: "research_status",
        text:
          "JinXing double-nib model details remain pending until direct collector, product, or review sources are attached.",
        sourceItemId: "source-jinxing-double-nib-public-search",
        confidence: 0.32,
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "长江-zhangjiang-988",
    brandSlug: "zhangjiang",
    aliases: [
      { alias: "长江 988", language: "zh", sourceId: "public-web-research-index" },
      { alias: "ZhangJiang 988", language: "en", sourceId: "public-web-research-index" },
    ],
    sourceItemIds: ["source-zhangjiang-988-public-search"],
    spec: {
      id: "spec-zhangjiang-988",
      seriesName: "988",
      releaseYear: "待核验",
      originCountry: "中国",
      nib: "钢尖/规格待核验",
      fillSystem: "待核验",
      material: "待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "待核验",
      status: "待核验",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-zhangjiang-988-research-gap",
      title: "988 先作为长江型号索引",
      storyType: "model_story",
      summary:
        "长江 988 页面先保留型号入口，等待直接来源补齐参数。",
      bodyMd: researchQueueModelStory("长江 ZhangJiang 988", "988型号来源和规格"),
      status: "needs_sources",
      sourceNotes: "Research-index draft only; direct sources are still required.",
      sourceItemIds: ["source-zhangjiang-988-public-search"],
      claimIds: ["claim-zhangjiang-988-research-status"],
    },
    claims: [
      {
        id: "claim-zhangjiang-988-research-status",
        predicate: "research_status",
        text:
          "ZhangJiang 988 remains a research-queue model until direct sources verify specifications and production context.",
        sourceItemId: "source-zhangjiang-988-public-search",
        confidence: 0.32,
        reviewStatus: "needs_source",
      },
    ],
  },
  ...REMAINING_GAP_ENTRIES.map(makeResearchQueueModel),
];

const LIMIT = LIMIT_ARG
  ? Number.parseInt(LIMIT_ARG.replace("--limit=", ""), 10)
  : undefined;

function getClient() {
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return createClient({ url: "file:data/fpkg.db" });
}

async function execute(db: Client, sql: string, args: unknown[] = []) {
  await db.execute({ sql, args: args as InArgs });
}

async function runMigrations(db: Client) {
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  );

  if (!fs.existsSync(MIGRATIONS_DIR)) return;

  const appliedRows = await db.execute("SELECT name FROM migrations");
  const applied = new Set(appliedRows.rows.map((row) => String(row.name)));
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const hasLegacySchema =
    (
      await db.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'entities'",
      )
    ).rows.length > 0;

  for (const file of files) {
    if (applied.has(file)) continue;
    if (hasLegacySchema && file !== "011_library_schema.sql") {
      await execute(
        db,
        "INSERT OR IGNORE INTO migrations (name, applied_at) VALUES (?, datetime('now'))",
        [file],
      );
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    await db.executeMultiple(sql);
    await execute(
      db,
      "INSERT INTO migrations (name, applied_at) VALUES (?, datetime('now'))",
      [file],
    );
    console.log(`Applied migration: ${file}`);
  }
}

async function findEntity(db: Client, type: string, slug: string) {
  const result = await db.execute({
    sql: "SELECT id, type, slug, name FROM entities WHERE type = ? AND slug = ? LIMIT 1",
    args: [type, slug],
  });
  return (result.rows[0] as EntityRow | undefined) || null;
}

async function writeSourceRegistry(db: Client, source: SourceRegistrySeed) {
  await execute(
    db,
    `INSERT INTO source_registry
      (id, name, source_type, allowed_use, reliability, license, attribution, homepage_url, fetch_method, notes, last_checked_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'copyrighted; summary/link only', ?, ?, ?, ?, date('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      source_type = excluded.source_type,
      allowed_use = excluded.allowed_use,
      reliability = excluded.reliability,
      attribution = excluded.attribution,
      homepage_url = excluded.homepage_url,
      fetch_method = excluded.fetch_method,
      notes = excluded.notes,
      last_checked_at = excluded.last_checked_at,
      updated_at = datetime('now')`,
    [
      source.id,
      source.name,
      source.sourceType,
      source.allowedUse,
      source.reliability,
      source.attribution,
      source.homepageUrl,
      source.fetchMethod,
      source.notes,
    ],
  );
}

async function writeSourceItem(db: Client, item: SourceItemSeed) {
  await execute(
    db,
    `INSERT INTO source_items
      (id, source_id, title, url, item_type, license, author, published_at, retrieved_at, summary, allowed_use, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, 'copyrighted; summary/link only', ?, ?, date('now'), ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      source_id = excluded.source_id,
      title = excluded.title,
      url = excluded.url,
      item_type = excluded.item_type,
      author = excluded.author,
      published_at = excluded.published_at,
      retrieved_at = excluded.retrieved_at,
      summary = excluded.summary,
      allowed_use = excluded.allowed_use,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      item.id,
      item.sourceId,
      item.title,
      item.url,
      item.itemType,
      item.author,
      item.publishedAt || null,
      item.summary,
      item.allowedUse,
      item.reviewStatus,
    ],
  );
}

async function writeReference(
  db: Client,
  entity: EntityRow,
  sourceItemId: string,
  relationType: "reference" | "review" | "history" | "official" | "community",
  reviewStatus: "pending" | "approved" | "rejected",
) {
  await execute(
    db,
    `INSERT INTO entity_references
      (id, entity_id, source_item_id, relation_type, note, review_status)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(entity_id, source_item_id, relation_type) DO UPDATE SET
      note = excluded.note,
      review_status = excluded.review_status`,
    [
      `reference-${relationType}-${entity.id}-${sourceItemId}`.slice(0, 160),
      entity.id,
      sourceItemId,
      relationType,
      relationType === "official"
        ? "Official source registered for summary-only library expansion."
        : "Research/reference source registered for under-documented entry expansion; direct fact claims remain review-gated.",
      reviewStatus,
    ],
  );
}

async function writeAlias(db: Client, entity: EntityRow, alias: AliasSeed) {
  await execute(
    db,
    `INSERT INTO entity_aliases
      (id, entity_id, alias, language, source_id)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(entity_id, alias, language) DO UPDATE SET
      source_id = excluded.source_id`,
    [
      `alias-${entity.id}-${alias.language}-${alias.alias}`.slice(0, 160),
      entity.id,
      alias.alias,
      alias.language,
      alias.sourceId || null,
    ],
  );
}

async function writeExternalId(
  db: Client,
  entity: EntityRow,
  externalId: ExternalIdSeed,
) {
  await execute(
    db,
    `INSERT INTO external_ids
      (id, entity_id, provider, external_id, url, metadata_json, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(entity_id, provider, external_id) DO UPDATE SET
      url = excluded.url,
      metadata_json = excluded.metadata_json,
      updated_at = datetime('now')`,
    [
      `external-${entity.id}-${externalId.provider}-${externalId.externalId}`.slice(0, 160),
      entity.id,
      externalId.provider,
      externalId.externalId,
      externalId.url,
      externalId.metadataJson || null,
    ],
  );
}

async function writeClaim(db: Client, entity: EntityRow, claim: ClaimSeed) {
  await execute(
    db,
    `INSERT INTO claims
      (id, subject_entity_id, predicate, object_text, source_item_id, evidence_locator, confidence, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      predicate = excluded.predicate,
      object_text = excluded.object_text,
      source_item_id = excluded.source_item_id,
      evidence_locator = excluded.evidence_locator,
      confidence = excluded.confidence,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      claim.id,
      entity.id,
      claim.predicate,
      claim.text,
      claim.sourceItemId,
      claim.evidenceLocator || null,
      claim.confidence,
      claim.reviewStatus,
    ],
  );

  await execute(
    db,
    `INSERT INTO citations
      (id, target_type, target_id, source_item_id, claim_id, note)
     VALUES (?, 'claim', ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      source_item_id = excluded.source_item_id,
      claim_id = excluded.claim_id,
      note = excluded.note`,
    [
      `cite-${claim.id}-${claim.sourceItemId}`.slice(0, 160),
      claim.id,
      claim.sourceItemId,
      claim.id,
      "Structured claim cites this source item. Review status indicates whether it can be treated as fact.",
    ],
  );
}

async function writeStory(db: Client, entity: EntityRow, story: StorySeed) {
  await execute(
    db,
    `INSERT INTO stories
      (id, entity_id, title, story_type, summary, body_md, status, source_notes, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      story_type = excluded.story_type,
      summary = excluded.summary,
      body_md = excluded.body_md,
      status = excluded.status,
      source_notes = excluded.source_notes,
      updated_at = datetime('now')`,
    [
      story.id,
      entity.id,
      story.title,
      story.storyType,
      story.summary,
      story.bodyMd,
      story.status,
      story.sourceNotes,
    ],
  );

  for (const sourceItemId of story.sourceItemIds) {
    await execute(
      db,
      `INSERT INTO citations
        (id, target_type, target_id, source_item_id, note)
       VALUES (?, 'story', ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        source_item_id = excluded.source_item_id,
        note = excluded.note`,
      [
        `cite-${story.id}-${sourceItemId}`.slice(0, 160),
        story.id,
        sourceItemId,
        "Story draft uses this source as a summary/link-only anchor.",
      ],
    );
  }

  for (const claimId of story.claimIds) {
    await execute(
      db,
      `INSERT INTO citations
        (id, target_type, target_id, claim_id, note)
       VALUES (?, 'story', ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        claim_id = excluded.claim_id,
        note = excluded.note`,
      [
        `cite-${story.id}-${claimId}`.slice(0, 160),
        story.id,
        claimId,
        "Story draft cites this structured claim.",
      ],
    );
  }
}

async function writeTimeline(
  db: Client,
  entity: EntityRow,
  timeline: TimelineSeed,
) {
  await execute(
    db,
    `INSERT INTO timeline_events
      (id, entity_id, title, event_type, start_date, circa, description, source_item_id, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      event_type = excluded.event_type,
      start_date = excluded.start_date,
      circa = excluded.circa,
      description = excluded.description,
      source_item_id = excluded.source_item_id,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      timeline.id,
      entity.id,
      timeline.title,
      timeline.eventType,
      timeline.startDate,
      timeline.circa ? 1 : 0,
      timeline.description,
      timeline.sourceItemId,
      timeline.reviewStatus,
    ],
  );
}

async function writeModelSpec(
  db: Client,
  model: EntityRow,
  brand: EntityRow | null,
  spec: ModelSpecSeed,
  sourceItemId: string,
) {
  await execute(
    db,
    `INSERT INTO model_specs
      (id, entity_id, brand_entity_id, series_name, release_year, origin_country, nib, fill_system, material, dimensions, weight, price_range, status, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(entity_id) DO UPDATE SET
      brand_entity_id = excluded.brand_entity_id,
      series_name = excluded.series_name,
      release_year = excluded.release_year,
      origin_country = excluded.origin_country,
      nib = excluded.nib,
      fill_system = excluded.fill_system,
      material = excluded.material,
      dimensions = excluded.dimensions,
      weight = excluded.weight,
      price_range = excluded.price_range,
      status = excluded.status,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      spec.id,
      model.id,
      brand?.id || null,
      spec.seriesName,
      spec.releaseYear,
      spec.originCountry,
      spec.nib,
      spec.fillSystem,
      spec.material,
      spec.dimensions,
      spec.weight,
      spec.priceRange,
      spec.status,
      spec.reviewStatus,
    ],
  );

  await execute(
    db,
    `INSERT INTO citations
      (id, target_type, target_id, source_item_id, note)
     VALUES (?, 'model_spec', ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      source_item_id = excluded.source_item_id,
      note = excluded.note`,
    [
      `cite-${spec.id}-${sourceItemId}`.slice(0, 160),
      spec.id,
      sourceItemId,
      "Model spec uses this source item as its current evidence anchor; review status controls factual confidence.",
    ],
  );
}

async function writeVariant(
  db: Client,
  model: EntityRow,
  variant: VariantSeed,
) {
  await execute(
    db,
    `INSERT INTO model_variants
      (id, model_entity_id, variant_name, release_year, notes, source_item_id, review_status)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(model_entity_id, variant_name) DO UPDATE SET
      release_year = excluded.release_year,
      notes = excluded.notes,
      source_item_id = excluded.source_item_id,
      review_status = excluded.review_status`,
    [
      variant.id,
      model.id,
      variant.name,
      variant.releaseYear || null,
      variant.notes,
      variant.sourceItemId || null,
      variant.reviewStatus,
    ],
  );
}

async function writeBrandModelLink(
  db: Client,
  brand: EntityRow | null,
  model: EntityRow,
) {
  if (!brand) return;
  await execute(
    db,
    `INSERT INTO entity_links
      (id, source_id, target_id, link_type)
     VALUES (?, ?, ?, 'brand_model')
     ON CONFLICT(source_id, target_id, link_type) DO NOTHING`,
    [`link-brand-model-${brand.id}-${model.id}`.slice(0, 160), brand.id, model.id],
  );
}

async function writeBrand(db: Client, seed: BrandSeed) {
  const brand = await findEntity(db, "brand", seed.slug);
  if (!brand) {
    console.warn(`Skip brand ${seed.slug}: entity not found`);
    return;
  }

  for (const sourceItemId of seed.sourceItemIds) {
    const isOfficial = sourceItemId.includes("official");
    await writeReference(
      db,
      brand,
      sourceItemId,
      isOfficial ? "official" : "reference",
      isOfficial ? "approved" : "pending",
    );
  }
  for (const alias of seed.aliases) await writeAlias(db, brand, alias);
  for (const externalId of seed.externalIds || []) {
    await writeExternalId(db, brand, externalId);
  }
  for (const claim of seed.claims) await writeClaim(db, brand, claim);
  await writeStory(db, brand, seed.story);
  if (seed.timeline) await writeTimeline(db, brand, seed.timeline);
}

async function writeModel(db: Client, seed: ModelSeed) {
  const model = await findEntity(db, "pen", seed.slug);
  if (!model) {
    console.warn(`Skip model ${seed.slug}: entity not found`);
    return;
  }
  const brand = await findEntity(db, "brand", seed.brandSlug);

  for (const sourceItemId of seed.sourceItemIds) {
    await writeReference(
      db,
      model,
      sourceItemId,
      sourceItemId.includes("official") ? "official" : "reference",
      sourceItemId.includes("official") ? "approved" : "pending",
    );
  }
  for (const alias of seed.aliases) await writeAlias(db, model, alias);
  await writeModelSpec(db, model, brand, seed.spec, seed.sourceItemIds[0]);
  for (const claim of seed.claims) await writeClaim(db, model, claim);
  await writeStory(db, model, seed.story);
  for (const variant of seed.variants || []) await writeVariant(db, model, variant);
  if (seed.timeline) await writeTimeline(db, model, seed.timeline);
  await writeBrandModelLink(db, brand, model);
}

async function main() {
  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");
  if (WRITE) await runMigrations(db);

  const brands = typeof LIMIT === "number" ? BRANDS.slice(0, LIMIT) : BRANDS;
  const modelSlugs = new Set(brands.map((brand) => brand.slug));
  const models =
    typeof LIMIT === "number"
      ? MODELS.filter((model) => modelSlugs.has(model.brandSlug))
      : MODELS;

  console.log(
    WRITE
      ? "Research-gap source import: write mode"
      : "Research-gap source import: dry run",
  );
  console.log(
    `Sources: ${SOURCE_REGISTRY.length}, items: ${SOURCE_ITEMS.length}, brands: ${brands.length}, models: ${models.length}`,
  );

  if (!WRITE) {
    for (const brand of brands) {
      console.log(`Brand ${brand.slug}: ${brand.sourceItemIds.join(", ")}`);
    }
    for (const model of models) {
      console.log(`Model ${model.slug}: ${model.sourceItemIds.join(", ")}`);
    }
    console.log("Dry run only. Re-run with --write to store research-gap sources.");
    return;
  }

  for (const source of SOURCE_REGISTRY) await writeSourceRegistry(db, source);
  for (const item of SOURCE_ITEMS) await writeSourceItem(db, item);
  for (const brand of brands) await writeBrand(db, brand);
  for (const model of models) await writeModel(db, model);

  console.log("Research-gap source import complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
