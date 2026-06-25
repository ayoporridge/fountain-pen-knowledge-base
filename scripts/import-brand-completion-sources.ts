import fs from "node:fs";
import path from "node:path";
import { createClient, type Client, type InArgs } from "@libsql/client";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");
const WRITE = process.argv.includes("--write");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : undefined;

type SourceRegistrySeed = {
  id: string;
  name: string;
  sourceType: "official" | "wikimedia" | "blog";
  reliability: "high_for_basic_facts" | "official_marketing" | "medium";
  attribution: string;
  homepageUrl: string;
  notes: string;
};

type SourceItemSeed = {
  id: string;
  sourceId: string;
  title: string;
  url: string;
  itemType: string;
  summary: string;
};

type SourceSeed = {
  registry: SourceRegistrySeed;
  item: SourceItemSeed;
  relationType: "official" | "history" | "reference";
};

type AliasSeed = {
  alias: string;
  language: string;
  sourceId?: string;
};

type ExternalIdSeed = {
  provider: string;
  externalId: string;
  url: string;
  metadataJson?: string;
};

type ClaimSeed = {
  id: string;
  predicate: string;
  text: string;
  sourceItemId: string;
  evidenceLocator: string;
  confidence: number;
};

type StorySeed = {
  id: string;
  title: string;
  summary: string;
  bodyMd: string;
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
  description: string;
  circa?: boolean;
  sourceItemId: string;
};

type BrandCompletionSeed = {
  slug: string;
  sources?: SourceSeed[];
  aliases?: AliasSeed[];
  externalIds?: ExternalIdSeed[];
  claims?: ClaimSeed[];
  story?: StorySeed;
  timeline?: TimelineSeed;
};

type EntityRow = {
  id: string;
  slug: string;
  name: string;
};

const officialSource = (
  id: string,
  name: string,
  attribution: string,
  homepageUrl: string,
  notes: string,
): SourceRegistrySeed => ({
  id,
  name,
  sourceType: "official",
  reliability: "official_marketing",
  attribution,
  homepageUrl,
  notes,
});

const BRAND_COMPLETIONS: BrandCompletionSeed[] = [
  {
    slug: "montblanc",
    sources: [
      {
        registry: officialSource(
          "montblanc-official",
          "Montblanc official site",
          "Montblanc",
          "https://www.montblanc.com/",
          "Use for official brand positioning, company-origin anchors, and current collection context; summarize rather than copy.",
        ),
        item: {
          id: "source-montblanc-official-about",
          sourceId: "montblanc-official",
          title: "Montblanc: About Montblanc",
          url: "https://www.montblanc.com/en-us/discover/company/about-us.html",
          itemType: "official_about",
          summary:
            "Official Montblanc about page used for the 1906 origin anchor, Hamburg writing-instrument craft context, and broad maison positioning.",
        },
        relationType: "official",
      },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "montblanc.com",
        url: "https://www.montblanc.com/",
      },
    ],
    claims: [
      {
        id: "claim-montblanc-official-1906-anchor",
        predicate: "official_history_anchor",
        text:
          "Montblanc official material frames the maison as pioneering since 1906 and ties its writing instruments to Hamburg craft.",
        sourceItemId: "source-montblanc-official-about",
        evidenceLocator: "About Montblanc / Pioneering since 1906",
        confidence: 0.78,
      },
    ],
    timeline: {
      id: "event-montblanc-1906-origin",
      title: "Montblanc official origin anchor",
      eventType: "brand_founded",
      startDate: "1906",
      description:
        "Official Montblanc material uses 1906 as the maison's origin anchor and places writing-instrument completion in Hamburg.",
      sourceItemId: "source-montblanc-official-about",
    },
    story: {
      id: "story-brand-montblanc-library",
      title: "从 Meisterstück 读万宝龙",
      summary:
        "Montblanc 品牌馆先以 1906 年官方源流、Hamburg 书写工具工艺和 Meisterstück 经典线作为入口，再把 149、146、144 与限量系列拆开阅读。",
      bodyMd:
        "Montblanc 的品牌馆不适合只写成“奢侈品牌”。更有用的入口，是把它放回 **1906 年官方源流、Hamburg 书写工具工艺、Meisterstück 经典线** 这三条线上读：一条讲品牌身份，一条讲制造与工艺，一条讲玩家真正会比较的笔型和系列。\n\n站内已经有 149、146、144、Writers Edition、Patron of Art 等型号或 collection 的谨慎档案。品牌馆这篇先做导览：把 Montblanc 作为“经典高端钢笔与收藏叙事”的入口，但不把每个年代、每个版本都写成已审核事实。后续型号差异仍要回到官方产品页、目录和可靠玩家资料逐项补证。",
      sourceNotes:
        "Draft based on Montblanc official about material and existing site model-source entries. Version-level Meisterstuck history remains intentionally scoped to model pages.",
      sourceItemIds: ["source-montblanc-official-about"],
      claimIds: ["claim-montblanc-official-1906-anchor"],
    },
  },
  {
    slug: "waterman",
    sources: [
      {
        registry: officialSource(
          "waterman-official",
          "Waterman official site",
          "Waterman",
          "https://www.waterman.com/",
          "Use for official brand heritage, timeline, and current collection context; summarize rather than copy.",
        ),
        item: {
          id: "source-waterman-official-heritage",
          sourceId: "waterman-official",
          title: "Waterman: Heritage",
          url: "https://www.waterman.com/waterman-history.html",
          itemType: "official_history",
          summary:
            "Official Waterman heritage page used for the 1883 Lewis Edson Waterman feed-system story and later French/Parisian brand context.",
        },
        relationType: "history",
      },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "waterman.com",
        url: "https://www.waterman.com/",
      },
    ],
    claims: [
      {
        id: "claim-waterman-official-1883-feed-anchor",
        predicate: "official_history_anchor",
        text:
          "Waterman official heritage presents 1883, Lewis Edson Waterman, and the Three Fissure Feed as the brand's foundational fountain-pen story.",
        sourceItemId: "source-waterman-official-heritage",
        evidenceLocator: "Waterman Heritage / 1883",
        confidence: 0.82,
      },
    ],
    timeline: {
      id: "event-waterman-1883-three-fissure-feed",
      title: "Lewis Edson Waterman feed-system milestone",
      eventType: "design_milestone",
      startDate: "1883",
      description:
        "Official Waterman heritage frames 1883 around Lewis Edson Waterman's feed-system invention and early reliable fountain-pen story.",
      sourceItemId: "source-waterman-official-heritage",
    },
    story: {
      id: "story-brand-waterman-library",
      title: "从可靠供墨读 Waterman",
      summary:
        "Waterman 品牌馆先以 1883 年供墨系统叙事为入口，再把美国起源、法国制造和 Carene 等现代型号分层处理。",
      bodyMd:
        "Waterman 的阅读入口很清楚：**供墨可靠性**。官方 heritage 页面把 1883 年、Lewis Edson Waterman 和 Three Fissure Feed 放在开头，这让 Waterman 不只是一个“法国优雅品牌”，也是早期自来水笔从漏墨焦虑走向可靠书写的一条线索。\n\n后续扩写 Waterman 时，需要把几层拆开：早期美国 Waterman 的技术故事、JIF-Waterman 和法国制造线索、以及现代 Carene、Expert、Hemisphere 等产品线。当前品牌故事只建立这个历史入口，具体型号体验仍然要用官方产品页和长期评测继续补证。",
      sourceNotes:
        "Draft based on the official Waterman heritage page. Model-line details remain pending until product/catalog and review sources are added.",
      sourceItemIds: ["source-waterman-official-heritage"],
      claimIds: ["claim-waterman-official-1883-feed-anchor"],
    },
  },
  {
    slug: "mg",
    sources: [
      {
        registry: officialSource(
          "mg-official",
          "M&G official site",
          "Shanghai M&G Stationery Inc.",
          "https://www.mgstationery.com/",
          "Use for official company profile, history, manufacturing, and product-system context; summarize rather than copy.",
        ),
        item: {
          id: "source-mg-official-profile",
          sourceId: "mg-official",
          title: "M&G Stationery: About Us",
          url: "https://www.mgstationery.com/col13/index",
          itemType: "official_company",
          summary:
            "Official M&G profile page used for integrated stationery manufacturing, R&D, pen-engineering, distribution, and current scale context.",
        },
        relationType: "official",
      },
      {
        registry: officialSource(
          "mg-official",
          "M&G official site",
          "Shanghai M&G Stationery Inc.",
          "https://www.mgstationery.com/",
          "Use for official company profile, history, manufacturing, and product-system context; summarize rather than copy.",
        ),
        item: {
          id: "source-mg-official-history",
          sourceId: "mg-official",
          title: "M&G Stationery: Our History",
          url: "https://www.mgstationery.com/col19/index",
          itemType: "official_history",
          summary:
            "Official M&G history page used for the 1989 startup note, 1997 M&G trademark launch, 2008 industrial base, and 2015 listing anchors.",
        },
        relationType: "history",
      },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "mgstationery.com",
        url: "https://www.mgstationery.com/",
      },
    ],
    claims: [
      {
        id: "claim-mg-official-1997-brand-anchor",
        predicate: "official_history_anchor",
        text:
          "M&G official history says the M&G trademark was launched in 1997, establishing the brand development path.",
        sourceItemId: "source-mg-official-history",
        evidenceLocator: "Our History / 1997",
        confidence: 0.82,
      },
      {
        id: "claim-mg-official-pen-engineering-anchor",
        predicate: "official_capability_anchor",
        text:
          "M&G official profile describes China Pen Industry Base, China Pen Center, and pen-engineering technology facilities within its industrial park context.",
        sourceItemId: "source-mg-official-profile",
        evidenceLocator: "About Us / Research and Development Design",
        confidence: 0.76,
      },
    ],
    timeline: {
      id: "event-mg-1997-brand-launch",
      title: "M&G trademark officially launched",
      eventType: "design_milestone",
      startDate: "1997",
      description:
        "Official M&G history presents 1997 as the moment when the M&G trademark was launched and the brand-development path was established.",
      sourceItemId: "source-mg-official-history",
    },
    story: {
      id: "story-brand-mg-library",
      title: "从大规模文具工业读晨光",
      summary:
        "晨光品牌馆先以 1997 年 M&G 商标、上海文具制造体系和笔类工程能力为入口，再谨慎拆解具体钢笔型号。",
      bodyMd:
        "晨光在钢笔图书馆里的位置，不是传统意义上的“收藏钢笔老牌”，而是**中国现代文具工业和大规模渠道体系**的一条入口。官方资料把 M&G 商标启动、研发设计、制造能力、渠道网络和笔类工程能力放在同一套公司叙事里，这比单独评价某一支入门钢笔更有解释力。\n\n后续扩写晨光时，应该把品牌工业史和具体钢笔体验拆开：K35、按动笔、学生文具、书写工具制造能力可以作为品牌脉络；具体钢笔型号的笔尖、上墨、耐用度和适用人群，则需要产品页、零售规格和玩家反馈逐项补证。",
      sourceNotes:
        "Draft based on M&G official profile and official history pages. Specific fountain-pen model claims remain pending product-source review.",
      sourceItemIds: [
        "source-mg-official-profile",
        "source-mg-official-history",
      ],
      claimIds: [
        "claim-mg-official-1997-brand-anchor",
        "claim-mg-official-pen-engineering-anchor",
      ],
    },
  },
  {
    slug: "parker",
    sources: [
      {
        registry: officialSource(
          "parker-official",
          "Parker official site",
          "Parker",
          "https://www.parkerpen.com/",
          "Use for official brand timeline, product milestones, and current collection context; summarize rather than copy.",
        ),
        item: {
          id: "source-parker-official-history",
          sourceId: "parker-official",
          title: "Parker: The History of Parker",
          url: "https://www.parkerpen.com/parker-history.html",
          itemType: "official_history",
          summary:
            "Official Parker timeline used for George Safford Parker's 1888 story, Lucky Curve, Duofold, Vacumatic, Parker 51, and later brand milestones.",
        },
        relationType: "history",
      },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "parkerpen.com",
        url: "https://www.parkerpen.com/",
      },
    ],
    claims: [
      {
        id: "claim-parker-official-1888-anchor",
        predicate: "official_history_anchor",
        text:
          "Parker official history frames 1888 and George Safford Parker's first pen patent as the beginning of the Parker story.",
        sourceItemId: "source-parker-official-history",
        evidenceLocator: "The History of Parker / 1888",
        confidence: 0.82,
      },
    ],
    timeline: {
      id: "event-parker-1888-origin",
      title: "George Safford Parker begins the Parker story",
      eventType: "brand_founded",
      startDate: "1888",
      description:
        "Official Parker history uses 1888 and George Safford Parker's first pen-patent moment as the origin of the brand story.",
      sourceItemId: "source-parker-official-history",
    },
    story: {
      id: "story-brand-parker-library",
      title: "从 Lucky Curve 到 Parker 51",
      summary:
        "Parker 品牌馆先以 1888 年、Lucky Curve、Duofold、Vacumatic 和 Parker 51 建立导览，再逐步拆型号档案。",
      bodyMd:
        "Parker 的品牌馆可以做成一条非常清晰的技术与设计时间线：1888 年的 George Safford Parker 起点、Lucky Curve 供墨系统、Duofold 的大尺寸与色彩记忆、Vacumatic 的可视墨仓和箭夹、以及 Parker 51 的暗尖与航空时代审美。它不是一个单点品牌，而是一串会影响玩家比较方式的型号节点。\n\n后续扩写 Parker 时，最重要的是把“品牌神话”和“具体版本”分开。51、Duofold、Vacumatic、Sonnet、IM 等系列的年代、产地、上墨方式和玩家评价差异很大，应该逐个档案化。当前品牌故事先建立阅读路径，型号页再承接细节。",
      sourceNotes:
        "Draft based on Parker official timeline. Model-level specs and vintage-version differences need model-specific catalog and review sources.",
      sourceItemIds: ["source-parker-official-history"],
      claimIds: ["claim-parker-official-1888-anchor"],
    },
  },
  {
    slug: "sheaffer",
    sources: [
      {
        registry: officialSource(
          "sheaffer-official",
          "Sheaffer official site",
          "Sheaffer",
          "https://sheaffer.com/",
          "Use for official blog/history context and current company notes; summarize rather than copy.",
        ),
        item: {
          id: "source-sheaffer-official-history-blog",
          sourceId: "sheaffer-official",
          title: "Sheaffer: History and Current Technology Used",
          url: "https://sheaffer.com/blogs/news/sheaffer-history-and-current-technology-used",
          itemType: "official_history_blog",
          summary:
            "Official Sheaffer blog article used for the 1913 Walter A. Sheaffer lever fountain pen anchor, White Dot note, and 2022 William Penn acquisition context.",
        },
        relationType: "history",
      },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "sheaffer.com",
        url: "https://sheaffer.com/",
      },
    ],
    claims: [
      {
        id: "claim-sheaffer-official-1913-lever-anchor",
        predicate: "official_history_anchor",
        text:
          "Sheaffer official material frames 1913 and Walter A. Sheaffer's lever fountain pen test in Fort Madison as the beginning of the brand's pen story.",
        sourceItemId: "source-sheaffer-official-history-blog",
        evidenceLocator: "Sheaffer history / 1913",
        confidence: 0.78,
      },
    ],
    timeline: {
      id: "event-sheaffer-1913-lever-filler",
      title: "Walter A. Sheaffer lever-filler milestone",
      eventType: "design_milestone",
      startDate: "1913",
      description:
        "Official Sheaffer material uses 1913 and a lever fountain pen test in Fort Madison as the starting point for the brand's writing-instrument story.",
      sourceItemId: "source-sheaffer-official-history-blog",
    },
    story: {
      id: "story-brand-sheaffer-library",
      title: "从 lever filler 和 White Dot 读 Sheaffer",
      summary:
        "Sheaffer 品牌馆先以 1913 年 lever filler、Fort Madison 和 White Dot 为入口，再把 Balance、Touchdown、Snorkel 与现代品牌关系分开。",
      bodyMd:
        "Sheaffer 的图书馆入口应该从一个机制开始：**lever filler**。官方材料把 1913 年 Walter A. Sheaffer 在 Fort Madison 测试 lever fountain pen 作为品牌故事起点，这让 Sheaffer 天然适合放在“上墨机制创新”和“美国钢笔工业”两条路径上读。\n\n后续扩写时，Sheaffer 要重点拆 Balance、Touchdown、Snorkel、White Dot、Imperial 等线索；同时也要把历史 Sheaffer、WASP 等关联线和现代 Sheaffer 品牌运营区分开。当前草稿先立起品牌入口，具体机制和版本仍留给专门型号页与机制图示。",
      sourceNotes:
        "Draft based on Sheaffer official history blog. Vintage mechanism and series-level claims need additional catalog, repair, and collector sources.",
      sourceItemIds: ["source-sheaffer-official-history-blog"],
      claimIds: ["claim-sheaffer-official-1913-lever-anchor"],
    },
  },
  {
    slug: "pelikan",
    sources: [
      {
        registry: officialSource(
          "pelikan-official",
          "Pelikan official site",
          "Pelikan",
          "https://www.pelikan.com/",
          "Use for official brand history, timeline, and writing-instrument milestones; summarize rather than copy.",
        ),
        item: {
          id: "source-pelikan-official-history",
          sourceId: "pelikan-official",
          title: "Pelikan: Our History",
          url: "https://www.pelikan.com/int/brand/our-history.html",
          itemType: "official_history",
          summary:
            "Official Pelikan history page used for the 1838 tradition date, 1878 trademark registration, 1929 first fountain pen, and Pelikano context.",
        },
        relationType: "history",
      },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "pelikan.com",
        url: "https://www.pelikan.com/",
      },
    ],
    claims: [
      {
        id: "claim-pelikan-official-1929-fountain-pen-anchor",
        predicate: "official_history_anchor",
        text:
          "Pelikan official history presents 1929 as the birth year of the Pelikan fountain pen, with the green marbled band as the outer trademark.",
        sourceItemId: "source-pelikan-official-history",
        evidenceLocator: "Our History / 1929",
        confidence: 0.82,
      },
    ],
    timeline: {
      id: "event-pelikan-1929-first-fountain-pen",
      title: "Pelikan first fountain pen",
      eventType: "design_milestone",
      startDate: "1929",
      description:
        "Official Pelikan history describes 1929 as the birth year of the Pelikan fountain pen and notes the green marbled band.",
      sourceItemId: "source-pelikan-official-history",
    },
    story: {
      id: "story-brand-pelikan-library",
      title: "从 1929 年第一支 Pelikan 钢笔读百利金",
      summary:
        "Pelikan 品牌馆先以 1838 传统日期、1878 商标、1929 第一支钢笔和 Pelikano 教育线索建立导览。",
      bodyMd:
        "Pelikan 的品牌馆不要只写“德国活塞上墨代表”。官方历史其实给了更长的入口：1838 的传统日期、1878 的商标注册、1929 的第一支 Pelikan fountain pen，以及后来 Pelikano 和教育书写工具的长期线索。这样读，Pelikan 同时属于墨水、绘画材料、学校书写和高端钢笔几个世界。\n\n后续扩写时，可以把 Souveran、Pelikano、M 系列尺寸、绿条纹和活塞结构分成不同档案。当前品牌故事先建立 1929 这个钢笔入口，不把所有 Pelikan 历史都压缩成一条高端产品线。",
      sourceNotes:
        "Draft based on Pelikan official history. Souveran/M-series specifications and vintage piston details need product/catalog and repair sources.",
      sourceItemIds: ["source-pelikan-official-history"],
      claimIds: ["claim-pelikan-official-1929-fountain-pen-anchor"],
    },
  },
  {
    slug: "faber-castell",
    sources: [
      {
        registry: officialSource(
          "faber-castell-official",
          "Faber-Castell official site",
          "Faber-Castell",
          "https://fabercastell.com/",
          "Use for official company history, fine-writing category context, and current brand-positioning notes; summarize rather than copy.",
        ),
        item: {
          id: "source-faber-castell-official-about",
          sourceId: "faber-castell-official",
          title: "Faber-Castell: About Us",
          url: "https://fabercastell.com/pages/about-us",
          itemType: "official_about",
          summary:
            "Official Faber-Castell about page used for the 1761 Stein origin, pencil/art-material history, fine-writing category, and global brand context.",
        },
        relationType: "official",
      },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "fabercastell.com",
        url: "https://fabercastell.com/",
      },
    ],
    claims: [
      {
        id: "claim-faber-castell-official-1761-anchor",
        predicate: "official_history_anchor",
        text:
          "Faber-Castell official material dates the company's history to 1761 in Stein, Germany, beginning as a pencil manufacturing business.",
        sourceItemId: "source-faber-castell-official-about",
        evidenceLocator: "About Us / Company History",
        confidence: 0.82,
      },
    ],
    timeline: {
      id: "event-faber-castell-1761-origin",
      title: "Faber-Castell history dates to Stein",
      eventType: "brand_founded",
      startDate: "1761",
      description:
        "Official Faber-Castell material dates the company's history to 1761 in Stein, Germany, beginning with pencil manufacturing.",
      sourceItemId: "source-faber-castell-official-about",
    },
    story: {
      id: "story-brand-faber-castell-library",
      title: "从铅笔工业到 Fine Writing",
      summary:
        "Faber-Castell 品牌馆先以 1761 年 Stein 起源、绘写材料工业和 Fine Writing 类目为入口，再拆 Ambition、e-motion、Ondoro 等现代钢笔线。",
      bodyMd:
        "Faber-Castell 在钢笔图书馆里需要一个温和的定位：它不是单纯靠钢笔建立的品牌，而是从 **1761 年 Stein 的铅笔与绘写材料工业**一路延展到现代 Fine Writing。这样处理，页面就不会把辉柏嘉误写成只服务钢笔玩家的品牌，也能解释为什么它的钢笔常和设计、材料、文具系统一起被讨论。\n\n后续扩写时，Ambition、e-motion、Ondoro、Essentio、Hexo 等型号应该分别补产品页、材质和尺寸来源。当前品牌馆先建立“绘写材料大品牌里的钢笔支线”这个入口，避免把铅笔史和具体钢笔体验混成同一件事。",
      sourceNotes:
        "Draft based on Faber-Castell official about material. Fine-writing model details need current product pages and review sources.",
      sourceItemIds: ["source-faber-castell-official-about"],
      claimIds: ["claim-faber-castell-official-1761-anchor"],
    },
  },
  {
    slug: "leonardo",
    aliases: [
      {
        alias: "Leonardo Officina Italiana",
        language: "it",
        sourceId: "leonardo-official",
      },
      { alias: "Leonardo", language: "en", sourceId: "leonardo-official" },
      { alias: "莱昂纳多", language: "zh" },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "leonardopen.com",
        url: "https://leonardopen.com/",
      },
    ],
  },
  {
    slug: "wancher",
    aliases: [
      { alias: "Wancher", language: "en", sourceId: "wancher-official" },
      { alias: "Wancher Pen", language: "en", sourceId: "wancher-official" },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "wancherpen.com",
        url: "https://www.wancherpen.com/",
      },
    ],
  },
  {
    slug: "twsbi",
    aliases: [
      { alias: "TWSBI", language: "en", sourceId: "twsbi-official" },
      { alias: "三文堂", language: "zh", sourceId: "twsbi-official" },
      { alias: "San Wen Tong", language: "en", sourceId: "twsbi-official" },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "twsbi.com",
        url: "https://www.twsbi.com/",
      },
    ],
  },
  {
    slug: "nakaya",
    aliases: [
      { alias: "Nakaya", language: "en", sourceId: "nakaya-official" },
      {
        alias: "Nakaya Fountain Pen",
        language: "en",
        sourceId: "nakaya-official",
      },
      { alias: "中屋", language: "zh", sourceId: "nakaya-official" },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "nakaya.org",
        url: "https://www.nakaya.org/en/",
      },
    ],
  },
  {
    slug: "namiki",
    aliases: [
      { alias: "Namiki", language: "en", sourceId: "namiki-official" },
      { alias: "PILOT Namiki", language: "en", sourceId: "namiki-official" },
      { alias: "并木", language: "zh", sourceId: "namiki-official" },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "pilot-namiki.com",
        url: "https://www.pilot-namiki.com/en/",
      },
    ],
  },
  {
    slug: "chilton",
    aliases: [
      { alias: "Chilton", language: "en", sourceId: "richardspens" },
      {
        alias: "Chilton Pen Company",
        language: "en",
        sourceId: "richardspens",
      },
      {
        alias: "The Chilton Chiltonian",
        language: "en",
        sourceId: "richardspens",
      },
    ],
    externalIds: [
      {
        provider: "richardspens_profile",
        externalId: "chiltonian",
        url: "https://www.richardspens.com/ref/profiles/chiltonian.htm",
      },
    ],
  },
  {
    slug: "conklin",
    aliases: [
      { alias: "Conklin", language: "en", sourceId: "conklin-official" },
      { alias: "Conklin Pens", language: "en", sourceId: "conklin-official" },
      {
        alias: "Conklin Pen Company",
        language: "en",
        sourceId: "conklin-official",
      },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "conklinpens.com",
        url: "https://conklinpens.com/",
      },
    ],
  },
  {
    slug: "diplomat",
    aliases: [
      { alias: "DIPLOMAT", language: "en", sourceId: "diplomat-official" },
      { alias: "Diplomat", language: "en", sourceId: "diplomat-official" },
      {
        alias: "Diplomat Pen",
        language: "en",
        sourceId: "diplomat-official",
      },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "diplomat-pen.com",
        url: "https://www.diplomat-pen.com/en/",
      },
    ],
  },
  {
    slug: "dunn",
    aliases: [
      { alias: "Dunn", language: "en", sourceId: "richardspens" },
      { alias: "Dunn-Pen", language: "en", sourceId: "richardspens" },
      { alias: "The Dunn-Pen", language: "en", sourceId: "richardspens" },
    ],
    externalIds: [
      {
        provider: "richardspens_profile",
        externalId: "dunn",
        url: "https://www.richardspens.com/ref/profiles/dunn.htm",
      },
    ],
  },
  {
    slug: "esterbrook",
    aliases: [
      {
        alias: "Esterbrook",
        language: "en",
        sourceId: "esterbrook-official",
      },
      {
        alias: "Esterbrook Pens",
        language: "en",
        sourceId: "esterbrook-official",
      },
      {
        alias: "The Esterbrook Pen Company",
        language: "en",
        sourceId: "esterbrook-official",
      },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "esterbrookpens.com",
        url: "https://www.esterbrookpens.com/",
      },
    ],
  },
  {
    slug: "eversharp",
    aliases: [
      { alias: "Eversharp", language: "en", sourceId: "penhero" },
      { alias: "Wahl-Eversharp", language: "en", sourceId: "penhero" },
      { alias: "Wahl Eversharp", language: "en", sourceId: "penhero" },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "wahl-eversharp.com",
        url: "https://wahl-eversharp.com/",
      },
    ],
  },
  {
    slug: "graphomatic",
    aliases: [
      { alias: "Graphomatic", language: "en", sourceId: "richardspens" },
      {
        alias: "Graphomatic Inkmaker",
        language: "en",
        sourceId: "richardspens",
      },
      {
        alias: "Graphomatic Colonel",
        language: "en",
        sourceId: "richardspens",
      },
    ],
    externalIds: [
      {
        provider: "richardspens_profile",
        externalId: "inkmaker",
        url: "https://www.richardspens.com/ref/profiles/inkmaker.htm",
      },
    ],
  },
  {
    slug: "ingersoll",
    aliases: [
      { alias: "Ingersoll", language: "en", sourceId: "richardspens" },
      {
        alias: "Ingersoll Dollar Pen",
        language: "en",
        sourceId: "richardspens",
      },
      {
        alias: "Ingersoll Dollar",
        language: "en",
        sourceId: "richardspens",
      },
    ],
    externalIds: [
      {
        provider: "richardspens_profile",
        externalId: "ingersoll",
        url: "https://www.richardspens.com/ref/profiles/ingersoll.htm",
      },
    ],
  },
  {
    slug: "kaweco",
    aliases: [
      { alias: "Kaweco", language: "en", sourceId: "kaweco-official" },
      { alias: "Kaweco Pen", language: "en", sourceId: "kaweco-official" },
      { alias: "Kaweco Sport", language: "en", sourceId: "kaweco-official" },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "kaweco-pen.com",
        url: "https://www.kaweco-pen.com/en/",
      },
    ],
  },
  {
    slug: "moore",
    aliases: [
      { alias: "Moore", language: "en", sourceId: "penhero" },
      { alias: "Moore Pen Company", language: "en", sourceId: "penhero" },
      { alias: "Moore Fingertip", language: "en", sourceId: "penhero" },
    ],
    externalIds: [
      {
        provider: "penhero_profile",
        externalId: "moore-fingertip",
        url: "https://penhero.com/PenGallery/Moore/MooreFingertip.htm",
      },
    ],
  },
  {
    slug: "morrison",
    aliases: [
      { alias: "Morrison", language: "en", sourceId: "richardspens" },
      { alias: "Morrison's", language: "en", sourceId: "richardspens" },
      {
        alias: "Morrison's Patriot",
        language: "en",
        sourceId: "richardspens",
      },
    ],
    externalIds: [
      {
        provider: "richardspens_profile",
        externalId: "patriot",
        url: "https://www.richardspens.com/ref/profiles/patriot.htm",
      },
    ],
  },
  {
    slug: "noodlers",
    aliases: [
      { alias: "Noodler", language: "en" },
      { alias: "Noodler's", language: "en" },
      { alias: "Noodler's Ink", language: "en" },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "noodlersink.com",
        url: "https://noodlersink.com/",
      },
    ],
  },
  {
    slug: "opus88",
    aliases: [
      { alias: "Opus 88", language: "en", sourceId: "paper-mouse-blog" },
      { alias: "OPUS 88", language: "en", sourceId: "paper-mouse-blog" },
      { alias: "Opus88", language: "en", sourceId: "paper-mouse-blog" },
    ],
    externalIds: [
      {
        provider: "secondary_profile",
        externalId: "paper-mouse-opus88-spotlight",
        url: "https://www.thepapermouse.com/blogs/whats-new-at-the-paper-mouse/spotlight-opus-88",
      },
    ],
  },
  {
    slug: "skb",
    aliases: [
      { alias: "SKB", language: "en", sourceId: "skb-official" },
      { alias: "SKB文明鋼筆", language: "zh-hant", sourceId: "skb-official" },
      { alias: "文明鋼筆", language: "zh-hant", sourceId: "skb-official" },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "skb.com.tw",
        url: "https://www.skb.com.tw/",
      },
    ],
  },
  {
    slug: "wahl",
    aliases: [
      { alias: "Wahl", language: "en", sourceId: "richardspens" },
      { alias: "Wahl Pen", language: "en", sourceId: "richardspens" },
      { alias: "The Wahl Pen", language: "en", sourceId: "richardspens" },
    ],
    externalIds: [
      {
        provider: "richardspens_profile",
        externalId: "wahl_pen",
        url: "https://www.richardspens.com/ref/profiles/wahl_pen.htm",
      },
    ],
  },
  {
    slug: "wasp",
    aliases: [
      { alias: "WASP", language: "en", sourceId: "richardspens" },
      { alias: "Wasp", language: "en", sourceId: "richardspens" },
      { alias: "WASP Addipoint", language: "en", sourceId: "richardspens" },
    ],
    externalIds: [
      {
        provider: "richardspens_profile",
        externalId: "addipoint",
        url: "https://www.richardspens.com/ref/profiles/addipoint.htm",
      },
    ],
  },
  {
    slug: "wearever",
    aliases: [
      { alias: "Wearever", language: "en", sourceId: "richardspens" },
      { alias: "Wearever Zenith", language: "en", sourceId: "richardspens" },
      {
        alias: "The Wearever Zenith",
        language: "en",
        sourceId: "richardspens",
      },
    ],
    externalIds: [
      {
        provider: "richardspens_profile",
        externalId: "zenith",
        url: "https://www.richardspens.com/ref/profiles/zenith.htm",
      },
    ],
  },
  {
    slug: "monteverde",
    aliases: [
      {
        alias: "Monteverde",
        language: "en",
        sourceId: "monteverde-official",
      },
      {
        alias: "Monteverde USA",
        language: "en",
        sourceId: "monteverde-official",
      },
      { alias: "万特佳", language: "zh" },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "monteverdepens.com",
        url: "https://www.monteverdepens.com/",
      },
    ],
  },
  {
    slug: "duke",
    aliases: [
      { alias: "Duke", language: "en", sourceId: "duke-pens-australia" },
      { alias: "Duke Pens", language: "en", sourceId: "duke-pens-australia" },
      { alias: "公爵", language: "zh" },
    ],
    externalIds: [
      {
        provider: "secondary_profile",
        externalId: "duke-pens-australia-history",
        url: "https://www.dukepens.com.au/6.html",
      },
    ],
  },
  {
    slug: "penbbs",
    aliases: [
      { alias: "PenBBS", language: "en", sourceId: "gentleman-stationer" },
      { alias: "坛笔", language: "zh" },
      {
        alias: "PenBBS Fountain Pens",
        language: "en",
        sourceId: "narratess",
      },
    ],
    externalIds: [
      {
        provider: "secondary_profile",
        externalId: "gentleman-stationer-penbbs",
        url: "https://www.gentlemanstationer.com/penbbs",
      },
    ],
  },
  {
    slug: "hongdian",
    aliases: [
      { alias: "HongDian", language: "en", sourceId: "dapprman" },
      { alias: "Hong Dian", language: "en", sourceId: "everyday-scrawl" },
      { alias: "弘典", language: "zh" },
    ],
    externalIds: [
      {
        provider: "secondary_profile",
        externalId: "everyday-scrawl-hong-dian-dark-blue-forest",
        url: "https://everydayscrawlcom.wordpress.com/2020/10/18/hong-dian-dark-blue-forest/",
      },
    ],
  },
  {
    slug: "delike",
    aliases: [
      { alias: "Delike", language: "en", sourceId: "well-appointed-desk" },
      { alias: "得力克", language: "zh" },
      {
        alias: "Delike New Moon",
        language: "en",
        sourceId: "well-appointed-desk",
      },
    ],
    externalIds: [
      {
        provider: "secondary_profile",
        externalId: "wellappointed-delike-new-moon",
        url: "https://www.wellappointeddesk.com/2017/08/fountain-pen-review-delike-new-moon-aka-fake-sailor-pro-gear-slim/",
      },
    ],
  },
  {
    slug: "kaco",
    aliases: [
      { alias: "KACO", language: "en", sourceId: "kaco-official" },
      { alias: "文采", language: "zh", sourceId: "kaco-official" },
      { alias: "KACO 文采", language: "zh", sourceId: "kaco-official" },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "kaco.cc",
        url: "https://www.kaco.cc/",
      },
    ],
  },
  {
    slug: "majohn",
    aliases: [
      { alias: "Majohn", language: "en", sourceId: "sketchywolf" },
      { alias: "Moonman", language: "en", sourceId: "sketchywolf" },
      { alias: "末匠", language: "zh" },
    ],
    externalIds: [
      {
        provider: "secondary_profile",
        externalId: "sketchywolf-majohn-a1",
        url: "https://sketchywolf.wordpress.com/2022/09/10/majohn-moonman-a1-fine-fountain-pen-review/",
      },
    ],
  },
  {
    slug: "picasso",
    aliases: [
      { alias: "毕加索", language: "zh", sourceId: "picasso-official-cn" },
      { alias: "Picasso", language: "en", sourceId: "picasso-official-cn" },
      {
        alias: "Picasso Pen",
        language: "en",
        sourceId: "picasso-official-cn",
      },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "sh-picasso.com",
        url: "https://www.sh-picasso.com/",
      },
    ],
  },
  {
    slug: "wingsung",
    aliases: [
      { alias: "永生", language: "zh", sourceId: "frankunderwater" },
      { alias: "Wing Sung", language: "en", sourceId: "frankunderwater" },
      { alias: "New Wing Sung", language: "en", sourceId: "frankunderwater" },
    ],
    externalIds: [
      {
        provider: "secondary_profile",
        externalId: "frankunderwater-new-wing-sungs",
        url: "https://frankunderwater.com/2017/09/14/the-new-wing-sungs-explained/",
      },
    ],
  },
  {
    slug: "snowhite",
    aliases: [
      { alias: "白雪", language: "zh", sourceId: "snowhite-official" },
      { alias: "Snowhite", language: "en", sourceId: "snowhite-official" },
      { alias: "Snowhite Pen", language: "en", sourceId: "snowhite-official" },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "china-snowhite.com",
        url: "https://www.china-snowhite.com/",
      },
    ],
  },
  {
    slug: "hero",
    aliases: [
      { alias: "英雄", language: "zh", sourceId: "hero-group-official" },
      { alias: "Hero", language: "en", sourceId: "hero-group-official" },
      {
        alias: "Shanghai Hero",
        language: "en",
        sourceId: "hero-group-official",
      },
    ],
    externalIds: [
      {
        provider: "official_site",
        externalId: "hero.com.cn",
        url: "https://hero.com.cn/",
      },
    ],
  },
  {
    slug: "jinhao",
    aliases: [
      { alias: "金豪", language: "zh", sourceId: "alibaba-qiangu" },
      { alias: "Jinhao", language: "en", sourceId: "alibaba-qiangu" },
      {
        alias: "Shanghai Qiangu Stationery",
        language: "en",
        sourceId: "alibaba-qiangu",
      },
    ],
    externalIds: [
      {
        provider: "secondary_profile",
        externalId: "alibaba-qiangu-company-profile",
        url: "https://qiangu.en.alibaba.com/company_profile.html",
      },
    ],
  },
  {
    slug: "admok",
    externalIds: [
      {
        provider: "research_index",
        externalId: "admok-jian800-search",
        url: "https://www.bing.com/search?q=%22Admok%22+%22%E7%AE%80800%22+%22%E9%92%A2%E7%AC%94%22",
      },
    ],
  },
  {
    slug: "tramol",
    externalIds: [
      {
        provider: "research_index",
        externalId: "tramol-van-gogh-search",
        url: "https://www.bing.com/search?q=%22Tramol%22+%22%E6%A2%B5%E9%AB%98%22+%22%E9%92%A2%E7%AC%94%22",
      },
    ],
  },
  {
    slug: "shanghai",
    externalIds: [
      {
        provider: "research_index",
        externalId: "shanghai-1997-search",
        url: "https://www.bing.com/search?q=%22%E4%B8%8A%E6%B5%B7%22+%2297%E5%9B%9E%E5%BD%92%22+%22%E9%92%A2%E7%AC%94%22",
      },
    ],
  },
];

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

async function findBrand(db: Client, slug: string): Promise<EntityRow | null> {
  const result = await db.execute({
    sql: "SELECT id, slug, name FROM entities WHERE type = 'brand' AND slug = ? LIMIT 1",
    args: [slug],
  });
  return (result.rows[0] as EntityRow | undefined) || null;
}

async function existingIds(db: Client, table: string, ids: string[]) {
  if (ids.length === 0) return new Set<string>();
  const placeholders = ids.map(() => "?").join(", ");
  const result = await db.execute({
    sql: `SELECT id FROM ${table} WHERE id IN (${placeholders})`,
    args: ids,
  });
  return new Set(result.rows.map((row) => String(row.id)));
}

async function writeSourceRegistry(db: Client, source: SourceRegistrySeed) {
  await execute(
    db,
    `INSERT INTO source_registry
      (id, name, source_type, allowed_use, reliability, license, attribution, homepage_url, fetch_method, notes, last_checked_at, updated_at)
     VALUES (?, ?, ?, 'summary_only', ?, 'copyrighted; summary/link only', ?, ?, 'manual_verified_url', ?, date('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      source_type = excluded.source_type,
      reliability = excluded.reliability,
      attribution = excluded.attribution,
      homepage_url = excluded.homepage_url,
      notes = excluded.notes,
      last_checked_at = excluded.last_checked_at,
      updated_at = datetime('now')`,
    [
      source.id,
      source.name,
      source.sourceType,
      source.reliability,
      source.attribution,
      source.homepageUrl,
      source.notes,
    ],
  );
}

async function writeSourceItem(
  db: Client,
  item: SourceItemSeed,
  attribution: string,
) {
  await execute(
    db,
    `INSERT INTO source_items
      (id, source_id, title, url, item_type, license, author, retrieved_at, summary, allowed_use, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, 'copyrighted; summary/link only', ?, date('now'), ?, 'summary_only', 'approved', datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      source_id = excluded.source_id,
      title = excluded.title,
      url = excluded.url,
      item_type = excluded.item_type,
      author = excluded.author,
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
      attribution,
      item.summary,
    ],
  );
}

async function writeReference(
  db: Client,
  entity: EntityRow,
  sourceItemId: string,
  relationType: SourceSeed["relationType"],
) {
  await execute(
    db,
    `INSERT INTO entity_references
      (id, entity_id, source_item_id, relation_type, note, review_status)
     VALUES (?, ?, ?, ?, ?, 'approved')
     ON CONFLICT(entity_id, source_item_id, relation_type) DO UPDATE SET
      note = excluded.note,
      review_status = excluded.review_status`,
    [
      `reference-${relationType}-${entity.id}-${sourceItemId}`.slice(0, 160),
      entity.id,
      sourceItemId,
      relationType,
      "Official source registered for non-image brand story, timeline, and identifier completion. Summary/link only.",
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
      `external-${entity.id}-${externalId.provider}-${externalId.externalId}`.slice(
        0,
        160,
      ),
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
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      predicate = excluded.predicate,
      object_text = excluded.object_text,
      source_item_id = excluded.source_item_id,
      evidence_locator = excluded.evidence_locator,
      confidence = excluded.confidence,
      updated_at = datetime('now')`,
    [
      claim.id,
      entity.id,
      claim.predicate,
      claim.text,
      claim.sourceItemId,
      claim.evidenceLocator,
      claim.confidence,
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
      "Structured brand-completion claim cites this source item; review status remains pending.",
    ],
  );
}

async function writeStory(db: Client, entity: EntityRow, story: StorySeed) {
  await execute(
    db,
    `INSERT INTO stories
      (id, entity_id, title, story_type, summary, body_md, status, source_notes, updated_at)
     VALUES (?, ?, ?, 'brand_story', ?, ?, 'draft', ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      body_md = excluded.body_md,
      source_notes = excluded.source_notes,
      updated_at = datetime('now')`,
    [
      story.id,
      entity.id,
      story.title,
      story.summary,
      story.bodyMd,
      story.sourceNotes,
    ],
  );

  const presentSourceItems = await existingIds(
    db,
    "source_items",
    story.sourceItemIds,
  );
  const presentClaims = await existingIds(db, "claims", story.claimIds);

  for (const sourceItemId of presentSourceItems) {
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
        "Brand-completion story draft uses this source as a summary/link-only anchor.",
      ],
    );
  }

  for (const claimId of presentClaims) {
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
        "Brand-completion story draft cites this structured claim.",
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
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      event_type = excluded.event_type,
      start_date = excluded.start_date,
      circa = excluded.circa,
      description = excluded.description,
      source_item_id = excluded.source_item_id,
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
    ],
  );
}

async function writeBrandCompletion(
  db: Client,
  entity: EntityRow,
  seed: BrandCompletionSeed,
) {
  for (const source of seed.sources || []) {
    await writeSourceRegistry(db, source.registry);
    await writeSourceItem(db, source.item, source.registry.attribution);
    await writeReference(db, entity, source.item.id, source.relationType);
  }

  for (const alias of seed.aliases || []) {
    await writeAlias(db, entity, alias);
  }

  for (const externalId of seed.externalIds || []) {
    await writeExternalId(db, entity, externalId);
  }

  for (const claim of seed.claims || []) {
    await writeClaim(db, entity, claim);
  }

  if (seed.story) await writeStory(db, entity, seed.story);
  if (seed.timeline) await writeTimeline(db, entity, seed.timeline);
}

async function main() {
  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");
  if (WRITE) await runMigrations(db);

  const rows =
    Number.isFinite(LIMIT) && LIMIT && LIMIT > 0
      ? BRAND_COMPLETIONS.slice(0, LIMIT)
      : BRAND_COMPLETIONS;

  console.log(
    WRITE
      ? "Brand completion import: write mode"
      : "Brand completion import: dry run",
  );

  for (const seed of rows) {
    const entity = await findBrand(db, seed.slug);
    if (!entity) {
      console.warn(`Skip ${seed.slug}: local brand entity not found`);
      continue;
    }

    const actions = [
      seed.sources?.length ? `${seed.sources.length} sources` : null,
      seed.claims?.length ? `${seed.claims.length} claims` : null,
      seed.story ? "story" : null,
      seed.timeline ? "timeline" : null,
      seed.aliases?.length ? `${seed.aliases.length} aliases` : null,
      seed.externalIds?.length ? `${seed.externalIds.length} external ids` : null,
    ].filter(Boolean);

    console.log(`${entity.name} -> ${actions.join(", ")}`);
    if (WRITE) await writeBrandCompletion(db, entity, seed);
  }

  if (!WRITE) {
    console.log("Dry run only. Re-run with --write to store brand completions.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
