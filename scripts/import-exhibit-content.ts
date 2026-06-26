import fs from "node:fs";
import path from "node:path";
import { createClient, type Client, type InArgs } from "@libsql/client";

const WRITE = process.argv.includes("--write");
const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");
const RETRIEVED_AT = "2026-06-26";

type SourceRegistrySeed = {
  id: string;
  name: string;
  source_type:
    | "official"
    | "wikimedia"
    | "book"
    | "patent"
    | "blog"
    | "forum"
    | "reddit"
    | "retailer"
    | "user_submission";
  allowed_use:
    | "store_full"
    | "store_excerpt"
    | "summary_only"
    | "metadata_only"
    | "link_only"
    | "forbidden";
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
  homepage_url: string;
  notes: string;
};

type SourceItemSeed = {
  id: string;
  source_id: string;
  title: string;
  url: string;
  item_type: string;
  license?: string;
  author?: string;
  published_at?: string;
  summary: string;
  allowed_use:
    | "store_full"
    | "store_excerpt"
    | "summary_only"
    | "metadata_only"
    | "link_only"
    | "forbidden";
  review_status: "pending" | "approved" | "rejected" | "needs_review";
};

type ExhibitSeed = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: "draft" | "reviewed" | "published" | "deprecated";
  sections: Array<{
    id: string;
    title: string;
    body_md: string;
    related: string[];
    diagrams?: string[];
    sources: string[];
  }>;
};

const SOURCE_REGISTRIES: SourceRegistrySeed[] = [
  {
    id: "parker-penography",
    name: "The Parker Penography",
    source_type: "blog",
    allowed_use: "summary_only",
    reliability: "high_for_model_history",
    attribution: "Tony Fischier / parkerpens.net",
    homepage_url: "https://parkerpens.net/",
    notes:
      "Collector-maintained Parker model reference. Use for model chronology and variants with source-level caution.",
  },
  {
    id: "parker51-com",
    name: "Parker51.com",
    source_type: "blog",
    allowed_use: "summary_only",
    reliability: "high_for_model_history",
    attribution: "Parker51.com",
    homepage_url: "https://parker51.com/",
    notes:
      "Specialized Parker 51 collector reference. Use for version and chronology context, not as official Parker copy.",
  },
  {
    id: "the-gentleman-stationer",
    name: "The Gentleman Stationer",
    source_type: "blog",
    allowed_use: "summary_only",
    reliability: "medium",
    attribution: "The Gentleman Stationer",
    homepage_url: "https://www.gentlemanstationer.com/",
    notes:
      "Long-running stationery review site. Use for review context and modern user-facing interpretation.",
  },
  {
    id: "pelikan-collectibles",
    name: "Pelikan Collectibles",
    source_type: "blog",
    allowed_use: "summary_only",
    reliability: "high_for_model_history",
    attribution: "Pelikan Collectibles",
    homepage_url: "https://www.pelikan-collectibles.com/",
    notes:
      "Collector reference focused on Pelikan company and model history. Use alongside official Pelikan pages.",
  },
  {
    id: "the-pelikans-perch",
    name: "The Pelikan's Perch",
    source_type: "blog",
    allowed_use: "summary_only",
    reliability: "high_for_model_history",
    attribution: "The Pelikan's Perch",
    homepage_url: "https://thepelikansperch.com/",
    notes:
      "Specialist Pelikan blog. Use for model history, collector context, and modern Pelikan interpretation.",
  },
  {
    id: "gopens",
    name: "GoPens",
    source_type: "blog",
    allowed_use: "summary_only",
    reliability: "high_for_model_history",
    attribution: "GoPens",
    homepage_url: "https://gopens.com/",
    notes:
      "Vintage pen reference and dealer site. Use for filling-system explanations and vintage mechanism context.",
  },
  {
    id: "stdaily",
    name: "科技日报 / 中国科技网",
    source_type: "blog",
    allowed_use: "summary_only",
    reliability: "medium",
    attribution: "科技日报 / 中国科技网",
    homepage_url: "https://www.stdaily.com/",
    notes:
      "Chinese science and technology news outlet. Use as secondary reporting for current Hero manufacturing and brand-history context.",
  },
];

const SOURCE_ITEMS: SourceItemSeed[] = [
  {
    id: "source-lamy-2000-official",
    source_id: "lamy-official",
    title: "LAMY 2000 fountain pen",
    url: "https://www.lamy.com/en-us/p/lamy-2000-fountain-pen",
    item_type: "official_product_page",
    summary:
      "LAMY official product page for the LAMY 2000 fountain pen, including 1966 positioning, piston filling system, Makrolon/fibreglass body context, stainless fittings, and Gerd A. Müller designer attribution.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-lamy-design",
    source_id: "lamy-official",
    title: "The LAMY Design",
    url: "https://www.lamy.com/en-us/company/design",
    item_type: "official_design_page",
    summary:
      "LAMY official design page used for the brand's design-principle framing and designer-led product language.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-lamy-company",
    source_id: "lamy-official",
    title: "The company and the brand LAMY",
    url: "https://www.lamy.com/en-us/company",
    item_type: "official_company_page",
    summary:
      "LAMY official company page used for brand context and Heidelberg-based design/manufacturing positioning.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-lamy-2000-gentlemanstationer",
    source_id: "the-gentleman-stationer",
    title: "Pen Review: Lamy 2000 (Original Makrolon Version)",
    url: "https://www.gentlemanstationer.com/blog/2017/4/5/pen-review-lamy-2000",
    item_type: "review",
    author: "The Gentleman Stationer",
    published_at: "2017-04-05",
    summary:
      "Long-form user review used for modern reading context: continuous-production reputation, integrated ink window, brushed section, and daily writing interpretation.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-parker-official-history",
    source_id: "parker-official",
    title: "Parker: The History of Parker",
    url: "https://www.parkerpen.com/parker-history.html",
    item_type: "official_history",
    summary:
      "Parker official history page used for broad brand milestones and model-family positioning.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-parker-penography-51",
    source_id: "parker-penography",
    title: "The Parker Penography: Parker 51",
    url: "https://parkerpens.net/parker51.html",
    item_type: "collector_reference",
    summary:
      "Collector reference used for Parker 51 chronology, date-code notes, version distinctions, and model-history framing.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-parker51-versions",
    source_id: "parker51-com",
    title: "Parker51.com: 51 Versions",
    url: "https://parker51.com/index.php/51s/51-versions/",
    item_type: "collector_reference",
    summary:
      "Specialized Parker 51 reference used for version and chronology notes, including Special and late imprint/version distinctions.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-gentlemanstationer-parker51",
    source_id: "the-gentleman-stationer",
    title: "Vintage Pen Primer, Part II: The Parker 51",
    url: "https://www.gentlemanstationer.com/blog/2015/3/5/vintage-pen-primer-part-ii-the-parker-51",
    item_type: "review",
    author: "The Gentleman Stationer",
    published_at: "2015-03-05",
    summary:
      "Modern vintage-pen primer used for reader-facing explanation of the Parker 51, including Vacumatic and Aero-metric ownership context.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-richardspens-f1326f9cd153b9a7",
    source_id: "richardspens",
    title: "IV: The Parker “51” (Aero-metric Version)",
    url: "https://www.richardspens.com/ref/anatomy/51.htm",
    item_type: "technical_reference",
    summary:
      "Richard's Pens anatomy page used for Parker 51 Aero-metric structural reading and repair-aware vocabulary.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-richardspens-efcbf8a6431b56ff",
    source_id: "richardspens",
    title: "The Parker Vacumatic",
    url: "https://www.richardspens.com/ref/profiles/vac.htm",
    item_type: "model_profile",
    summary:
      "Richard's Pens model profile used for Vacumatic context when explaining Parker 51 filling-system lineage.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-pelikan-official-history",
    source_id: "pelikan-official",
    title: "Pelikan: Our History",
    url: "https://www.pelikan.com/int/brand/our-history.html",
    item_type: "official_history",
    summary:
      "Pelikan official history page used for 1838 tradition date, 1878 trademark registration, 1929 fountain-pen milestone, and Pelikano context.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-pelikan-collectibles-history",
    source_id: "pelikan-collectibles",
    title: "Pelikan Collectibles: History of Pelikan",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Company-History/index.html",
    item_type: "collector_reference",
    summary:
      "Collector history used for the 1929 first Pelikan fountain pen, differential piston mechanism, Model 100 context, and early Pelikan pen features.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-pelikans-perch-1929",
    source_id: "the-pelikans-perch",
    title: "News: Pelikan Herzstück 1929 Limited Edition",
    url: "https://thepelikansperch.com/2018/12/17/pelikan-herzstuck-1929-limited-edition/",
    item_type: "specialist_article",
    published_at: "2018-12-17",
    summary:
      "Specialist Pelikan article used for collector-level context around Theodor Kovacs, the 1929 piston milestone, and modern commemorative interpretation.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-richardspens-c995d03855e0283c",
    source_id: "richardspens",
    title: "Piston Pens",
    url: "https://www.richardspens.com/ref/fillers/piston.htm",
    item_type: "technical_reference",
    summary:
      "Richard's Pens technical reference used to explain piston fillers and contrast integrated piston systems with other filling approaches.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-richardspens-c406335395e6bb38",
    source_id: "richardspens",
    title: "How to Disassemble and Reassemble Pelikan Nib Units",
    url: "https://www.richardspens.com/ref/repair/pel_assy.htm",
    item_type: "repair_reference",
    summary:
      "Richard's Pens repair reference used for Pelikan screw-in nib-unit and maintenance context.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-richardspens-2b415662915ed6ee",
    source_id: "richardspens",
    title: "Filling Systems: Overview of How They Work and How to Fill Them",
    url: "https://www.richardspens.com/ref/fillers/fillers.htm",
    item_type: "technical_reference",
    summary:
      "Richard's Pens filling-system overview used for an entry-level explanation of fountain-pen filling mechanisms.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-gopens-vintage-fillers",
    source_id: "gopens",
    title: "Vintage Pen Filling Systems",
    url: "https://gopens.com/vintage-pen-filling-systems/",
    item_type: "technical_reference",
    published_at: "2016-05-19",
    summary:
      "Vintage filling-system overview used to explain lever, button, piston, vacuum, and other historical filler families at a high level.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-hero-group-about",
    source_id: "hero-group-official",
    title: "上海英雄（集团）：集团概况",
    url: "https://hero.com.cn/about.html",
    item_type: "official_company_page",
    summary:
      "Official Hero Group company overview used for brand identity and group context.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-hero-group-classic-products",
    source_id: "hero-group-official",
    title: "上海英雄（集团）：经典典藏",
    url: "https://hero.com.cn/product/2.html",
    item_type: "official_product_page",
    summary:
      "Official Hero Group classic-products page used for Hero model-family context.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-stdaily-hero-innovation",
    source_id: "stdaily",
    title: "“英雄”钢笔的创新传奇",
    url: "https://www.stdaily.com/web/gdxw/2026-04/13/content_501240.html",
    item_type: "news_article",
    author: "李均 / 科技日报",
    published_at: "2026-04-13",
    summary:
      "科技日报报道 used as secondary context for Hero's 1931 Huafu origin, 1939 trademark registration, Hero 100/200-era industrial ambition, and current workshop craft narrative.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-frankunderwater-new-wingsungs",
    source_id: "frankunderwater",
    title: "The New Wing Sung(s), Explained",
    url: "https://frankunderwater.com/2017/09/14/the-new-wing-sungs-explained/comment-page-1/",
    item_type: "blog_article",
    author: "FrankUnderwater",
    published_at: "2017-09-14",
    summary:
      "Blog reference used for modern Wing Sung licensing/revival context, with source-level caution for brand ownership and market interpretation.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-pilot-100th-history",
    source_id: "pilot-official",
    title: "PILOT's 100th anniversary: 100 years of history",
    url: "https://www.pilot.co.jp/100th/en/history/",
    item_type: "official_history",
    summary:
      "PILOT official centennial history used for Namiki/Wada, early Japanese-made gold nibs, 1918 founding context, and long-term innovation framing.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-pilot-custom-history",
    source_id: "pilot-official",
    title: "PILOT CUSTOM Series: History",
    url: "https://www.pilot-custom.jp/en/history/",
    item_type: "official_product_history",
    summary:
      "Official CUSTOM series history used for positioning the Custom family and Custom 823 as part of Pilot's long fountain-pen line.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-pilot-custom-series",
    source_id: "pilot-official",
    title: "PILOT CUSTOM series",
    url: "https://www.pilot-custom.jp/en/",
    item_type: "official_product_page",
    summary:
      "Official Custom series page used for the Custom line's 100-year Pilot fountain-pen context.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-platinum-100th-history",
    source_id: "platinum-official",
    title: "Platinum Pen: 100th Anniversary History",
    url: "https://www.platinum-pen.co.jp/100th_3/e-history.html",
    item_type: "official_history",
    summary:
      "Platinum official anniversary history used for 1919 Shunichi Nakata origin, Nakaya Seisakusho context, and early fountain-pen business timeline.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-platinum-3776-century-official",
    source_id: "platinum-official",
    title: "Platinum Pen USA: #3776 Century Collection",
    url: "https://platinumpenusa.com/luxury-writing/3776-collection/",
    item_type: "official_product_page",
    summary:
      "Official Platinum Pen USA #3776 Century page used for Slip & Seal mechanism, #3776 Century positioning, nib/feed language, and model-family framing.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-platinum-slip-seal",
    source_id: "platinum-official",
    title: "Platinum Pen USA: Slip & Seal Cap",
    url: "https://platinumpenusa.com/slip-seal-cap/",
    item_type: "official_mechanism_page",
    summary:
      "Official Platinum Pen USA mechanism page used for Slip & Seal cap context and #3776 Century sealing claims.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-sailor-official-history",
    source_id: "sailor-official",
    title: "Sailor: Our History",
    url: "https://en.sailor.co.jp/company/our-history/",
    item_type: "official_history",
    summary:
      "Official Sailor history page used for 1911 Sakata-Manufactory, gold-nib production, 1917 relocation, and early Japanese stationery innovation context.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-sailor-1911-series-official",
    source_id: "sailor-official",
    title: "Sailor: 1911 Series",
    url: "https://en.sailor.co.jp/topics/1911-series/",
    item_type: "official_product_page",
    summary:
      "Official Sailor 1911 Series page used for 1911/Realo product-family structure, 21K nib options, and piston/cartridge-converter distinction.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
  {
    id: "source-sailor-pro-gear-official",
    source_id: "sailor-official",
    title: "Sailor: Professional Gear Series",
    url: "https://en.sailor.co.jp/topics/professional-gear-series/",
    item_type: "official_product_page",
    summary:
      "Official Sailor Professional Gear page used for flat-top Pro Gear design, 14K/21K nib framing, and modern Sailor family comparison.",
    allowed_use: "summary_only",
    review_status: "approved",
  },
];

const EXHIBITS: ExhibitSeed[] = [
  {
    id: "exhibit-lamy-2000-modernism",
    slug: "lamy-2000-modernism",
    title: "LAMY 2000：现代主义如何落到手里",
    summary:
      "从 1966 年的产品发布、Gerd A. Müller 的工业设计语言、Makrolon 材料和活塞结构，读懂 LAMY 2000 为什么不像装饰品，却长期像一件工具标准。",
    status: "published",
    sections: [
      {
        id: "exhibit-lamy-2000-modernism-01",
        title: "1966 年不是复古标签，而是设计约束的起点",
        body_md: `LAMY 2000 的故事可以从一个简单问题开始：一支 1966 年问世的钢笔，为什么今天看起来仍然不像旧物？官方资料把 1966 年、Gerd A. Müller、设计史和工程性放在同一组叙述里。它的辨识度不是来自复古装饰，而是来自一套非常稳定的产品约束：少装饰、少接缝、少视觉噪音，同时保留完整的日用功能。

这让 LAMY 2000 和许多历史名笔形成了鲜明差异。Parker 51 或 Pelikan 100 常常带着时代材料和上墨系统的历史痕迹；LAMY 2000 更像一件长期服役的现代工业产品。拿起它时，用户先感到比例、触感、重心和上墨动作是否顺手，然后才意识到它已经跨过了半个多世纪。`,
        related: ["brand/lamy", "pen/凌美-lamy-lamy-2000"],
        sources: [
          "source-lamy-2000-official",
          "source-lamy-design",
          "source-lamy-company",
        ],
      },
      {
        id: "exhibit-lamy-2000-modernism-02",
        title: "材料：Makrolon、拉丝金属和几乎消失的接缝",
        body_md: `LAMY 2000 的“低调”并不只是黑色外观。官方资料给出的核心组合包括纤维增强聚碳酸酯语境的笔身、拉丝不锈钢部件、外弹簧笔夹和活塞上墨结构。现代用户评论反复提到的触点，也正是磨砂表面、金属握位、半包尖和墨窗这些细节。

这些材料选择把“好看”转化成了“少打扰”。笔身不会用亮面树脂抢注意力，金属部件也没有夸张装饰；它更在意握持时的阻尼、旋开笔尾时的动作反馈、吸墨后的余量观察，以及收入口袋时笔夹是否顺手。LAMY 2000 的现代感，很多时候来自这些不显眼的摩擦被逐一消除。`,
        related: ["pen/凌美-lamy-lamy-2000"],
        sources: [
          "source-lamy-2000-official",
          "source-lamy-2000-gentlemanstationer",
        ],
      },
      {
        id: "exhibit-lamy-2000-modernism-03",
        title: "半包尖和活塞：一支日用工具的隐藏工程",
        body_md: `LAMY 2000 的半包尖让视觉中心从笔尖转移到笔身整体。它不像开放式大金尖那样把书写身份摆在最前面，而是把笔尖、握位和笔身连接成更连续的工具形态。配合活塞上墨，它也把用户带回瓶装墨水，而不是一次性替换的消耗逻辑。

活塞结构的意义不只是容量。笔杆本身就是储墨系统，墨窗提供余量信息，笔尾旋钮负责动作反馈。半包尖隐藏了书写部件，活塞则把上墨动作收进笔身，二者共同构成了 LAMY 2000 的工具气质：外表安静，内部完整。`,
        related: [
          "pen/凌美-lamy-lamy-2000",
          "concept/piston-filler",
        ],
        diagrams: ["piston-filler-mechanism"],
        sources: [
          "source-lamy-2000-official",
          "source-richardspens-c995d03855e0283c",
        ],
      },
      {
        id: "exhibit-lamy-2000-modernism-04",
        title: "为什么它常被描述成“无聊”，却很难替代",
        body_md: `LAMY 2000 的口碑有一个有趣的反差：图片上它可能显得过于安静，拿在手里却很容易让人理解它的长期生命力。许多现代评论并不把它当作最华丽的钢笔，而是把它当作一支完成度很高的日常工具来谈：握持、平衡、墨量、耐看程度和长时间使用的一致性。

这种评价和官方规格形成了互补。官方资料说明了材料、结构和设计归属；长期评论则呈现这些设计如何进入真实使用。所谓“无聊”，往往不是缺少设计，而是设计被压低到不打扰书写。对一支日用笔来说，这恰恰是它很难被替代的原因。`,
        related: ["pen/凌美-lamy-lamy-2000"],
        sources: [
          "source-lamy-2000-official",
          "source-lamy-2000-gentlemanstationer",
        ],
      },
      {
        id: "exhibit-lamy-2000-modernism-05",
        title: "从 2000 回到 LAMY 的产品谱系",
        body_md: `LAMY 2000 也是进入 LAMY 产品谱系的一扇门。

- **品牌线**：LAMY 品牌馆展示了这种设计一致性如何成为品牌识别。
- **入门线**：Safari、AL-star 与 Studio 把人体工学、材料和价格层级拆成了更容易比较的样本。
- **机制线**：活塞上墨把 LAMY 2000 和 Pelikan、TWSBI、Pilot Custom 823 等储墨结构更鲜明的钢笔连接起来。

沿着这三条线看，LAMY 2000 不再只是“签字笔天花板”这类口号。它是一件能把设计、材料和上墨机制连接起来的现代工具，也是一把理解 LAMY 家族语言的钥匙。`,
        related: [
          "brand/lamy",
          "pen/凌美-lamy-lamy-2000",
          "pen/凌美-lamy-al-star-恒星",
          "pen/凌美-lamy-studio-演艺",
          "concept/piston-filler",
        ],
        sources: [
          "source-lamy-design",
          "source-lamy-2000-official",
          "source-richardspens-c995d03855e0283c",
        ],
      },
    ],
  },
  {
    id: "exhibit-parker-51-myth",
    slug: "parker-51-myth",
    title: "Parker 51：经典、复刻与神话",
    summary:
      "把 Parker 51 的 vintage 本体、Vacumatic 与 Aero-metric 代际、暗尖/收集器结构和现代复刻分开阅读，避免把历史声望和当代产品体验混在一起。",
    status: "published",
    sections: [
      {
        id: "exhibit-parker-51-myth-01",
        title: "先把“Parker 51”拆成几个对象",
        body_md: `Parker 51 的名字很容易让人直接想到“经典暗尖”，但这个名字下面其实有多层对象：1940 年代进入市场的 vintage 主线、早期 Vacumatic 上墨版本、后来的 Aero-metric 版本、不同年代和产地的细节差异，以及现代复刻产品。

这也是 Parker 51 迷人的地方。它既是一支具体的历史型号，也是一组被不断转述的设计记忆。Vintage 51 的声望来自历史语境、结构和长期使用；现代复刻则带着当代市场的材料、价格和品控背景。把这些层次拆开，经典才不会变成一句空泛的赞美。`,
        related: [
          "brand/parker",
          "pen/the-parker-51",
          "pen/派克-parker-51-经典-vintage",
          "pen/派克-parker-51复刻",
        ],
        sources: [
          "source-parker-official-history",
          "source-parker-penography-51",
          "source-parker51-versions",
        ],
      },
      {
        id: "exhibit-parker-51-myth-02",
        title: "从 Vacumatic 到 Aero-metric：同一个名字下的不同维护世界",
        body_md: `Parker 51 的代际差异，最直观地体现在上墨系统上。早期 51 借用了 Parker Vacumatic 的储墨和隔膜语境，容量和历史味道都很强，但清洗、维护和修复门槛也更高。后来的 Aero-metric 版本把使用动作变得更直接，日用压力也更低。

对收藏者而言，这种差异影响年代判断、修复成本和使用风险；对普通用户而言，它决定了一支 vintage 51 是否适合日常携带。Vacumatic 与 Aero-metric 不只是两个名词，它们分别对应不同的清洗方式、换墨体验、维修风险和长期使用成本。`,
        related: [
          "pen/the-parker-51",
          "article/iv-the-parker-51-aero-metric-version",
          "article/how-to-disassemble-and-reassemble-a-parker-51",
        ],
        sources: [
          "source-richardspens-efcbf8a6431b56ff",
          "source-richardspens-f1326f9cd153b9a7",
          "source-gentlemanstationer-parker51",
        ],
      },
      {
        id: "exhibit-parker-51-myth-03",
        title: "暗尖、收集器和“航空时代”的安静外形",
        body_md: `Parker 51 的视觉记忆来自暗尖，但它真正的工程魅力来自暗尖、收集器、笔舌和上墨系统共同构成的供墨结构。它压低了传统开放式笔尖的存在感，让用户看到更流线、更封闭、更现代的笔身。

这种外形也影响了后来许多暗尖日用笔的想象，包括中国用户熟悉的 Hero 100、Hero 616、Wing Sung 601 等。它们和 Parker 51 共享相邻的设计语境：暗尖、金属帽、低调外形和日用可靠性。但每个本地型号又带着自己的生产背景、价格记忆和使用故事。`,
        related: [
          "pen/the-parker-51",
          "pen/英雄-hero-100",
          "pen/英雄-hero-616",
          "pen/永生-wingsung-601",
        ],
        sources: [
          "source-parker-penography-51",
          "source-richardspens-f1326f9cd153b9a7",
        ],
      },
      {
        id: "exhibit-parker-51-myth-04",
        title: "经典神话和现代复刻要分开评价",
        body_md: `“Parker 51”这个名字太响亮，现代复刻因此天然背负期待。它继承了 51 的造型记忆和品牌资产，却生活在完全不同的市场里：当代材料、当代价格、当代品控和当代用户对“经典”的想象，都和 vintage 51 不同。

Vintage 51 的价值来自版本、年代、结构、修复和收藏语境；复刻 51 的价值则来自现代产品体验。把两者分开看，评价会更清楚：一边是历史名笔如何形成神话，另一边是品牌如何在今天重新调用这段神话。`,
        related: [
          "pen/派克-parker-51复刻",
          "pen/派克-parker-51-经典-vintage",
          "pen/the-parker-51",
        ],
        sources: [
          "source-parker-official-history",
          "source-parker51-versions",
          "source-gentlemanstationer-parker51",
        ],
      },
      {
        id: "exhibit-parker-51-myth-05",
        title: "从一个神话进入多个档案",
        body_md: `Parker 51 的故事可以分成四个档案来读。

1. Parker 品牌馆呈现 Duofold、Vacumatic 和 51 如何共同建立品牌声望。
2. The Parker 51 主档承载 vintage 版本、结构词汇和维修语境。
3. 现代复刻页单独记录当代产品的材料、上墨和市场体验。
4. Hero 100、Hero 616、Wing Sung 601 等暗尖日用笔展示设计影响如何进入本地记忆。

这四个档案放在一起，Parker 51 不再只是单一神话，而是一组从美国工业设计、维修文化、现代复刻和中国日用书写之间延伸出来的关系网。`,
        related: [
          "brand/parker",
          "pen/the-parker-51",
          "pen/派克-parker-51-经典-vintage",
          "pen/派克-parker-51复刻",
          "brand/hero",
          "brand/wingsung",
        ],
        sources: [
          "source-parker-penography-51",
          "source-parker51-versions",
          "source-gentlemanstationer-parker51",
        ],
      },
    ],
  },
  {
    id: "exhibit-pelikan-piston-filler",
    slug: "pelikan-piston-filler",
    title: "Pelikan 与活塞上墨传统",
    summary:
      "从 1838 年的墨水与颜料传统、1929 年第一支 Pelikan 活塞钢笔、Model 100 与 Souverän 尺寸树，进入 Pelikan 的品牌和机制谱系。",
    status: "published",
    sections: [
      {
        id: "exhibit-pelikan-piston-filler-01",
        title: "Pelikan 不是从高端钢笔开始的",
        body_md: `Pelikan 很容易被今天的用户记成“德国活塞代表”，但它的历史起点远早于现代高端钢笔。官方历史把品牌放在 1838 传统日期、墨水和颜料业务、商标注册、学校书写用品和后来的钢笔产品之间。Pelikan 的钢笔史，是从更长的书写材料史里长出来的。

因此，当用户看到 Souverän 或 M800 时，眼前不只是高端钢笔，还有墨水、学校书写、教育用品和办公材料的背景。Pelikan 的品牌气质同时来自两个世界：一边是可靠的书写材料，一边是活塞钢笔和尺寸体系带来的收藏与日用传统。`,
        related: ["brand/pelikan"],
        sources: [
          "source-pelikan-official-history",
          "source-pelikan-collectibles-history",
        ],
      },
      {
        id: "exhibit-pelikan-piston-filler-02",
        title: "1929：活塞不是卖点词，而是使用方式的改变",
        body_md: `1929 年的 Pelikan fountain pen 是 Pelikan 钢笔史的核心节点。官方和收藏资料都把这一年与第一支 Pelikan 钢笔、透明视窗、绿纹识别和差动活塞语境联系起来。它的意义不只是“储墨多”，还在于改变了用户理解上墨的方式。

旋转尾钮、移动活塞、密封笔杆、观察墨窗，这些动作让上墨变成一种清楚、可重复的日常操作。老 Pelikan 的维护复杂度和现代 Pelikan 的使用轻松感并不相同，但二者共享同一条线索：活塞把储墨系统变成了笔杆本身的一部分。`,
        related: ["brand/pelikan", "concept/piston-filler"],
        diagrams: ["piston-filler-mechanism"],
        sources: [
          "source-pelikan-official-history",
          "source-pelikan-collectibles-history",
          "source-pelikans-perch-1929",
          "source-richardspens-c995d03855e0283c",
        ],
      },
      {
        id: "exhibit-pelikan-piston-filler-03",
        title: "Souverän 尺寸树：M200 到 M1000 不是简单升级",
        body_md: `Pelikan 现代用户最常遇到的是 M 系列和 Souverän 尺寸梯度：M200、M400、M600、M800、M1000 等名称看起来像线性升级，但实际牵涉尺寸、重量、笔尖、握持和价格定位。M800 不是所有人的终点，M1000 也不是简单“更高级”，而是更大、更软、更有个性的选择。

把这些型号看成一棵尺寸树，会比把它们排成高低榜更准确。手长、书写压力、是否喜欢湿润出墨、是否需要大尺寸笔身、是否愿意维护活塞，都会改变用户对一支 Pelikan 的感受。Pelikan 的乐趣，正藏在这些相邻型号之间的细小差异里。`,
        related: [
          "pen/百利金-pelikan-m200",
          "pen/百利金-pelikan-m400",
          "pen/百利金-pelikan-m600",
          "pen/百利金-pelikan-m800",
          "pen/百利金-pelikan-m1000",
        ],
        sources: [
          "source-pelikan-official-history",
          "source-pelikan-collectibles-history",
          "source-richardspens-c995d03855e0283c",
        ],
      },
      {
        id: "exhibit-pelikan-piston-filler-04",
        title: "可换笔尖和维护：Pelikan 的另一条长期主义",
        body_md: `Pelikan 的可拆笔尖单元和活塞结构，让它天然属于“可维护钢笔”的讨论。Richard's Pens 的维修资料展示了一个容易被忽略的事实：老 Pelikan、新 Pelikan、不同笔尖单元之间并不总是完全互通，拆装和替换也受到年代和规格边界影响。

这让 Pelikan 的长期主义不只停留在品牌故事里。能否长期使用，取决于结构是否清楚、零件是否容易取得、维修资料是否充分，以及用户是否理解自己的笔属于哪个年代和规格。`,
        related: [
          "brand/pelikan",
          "article/how-to-disassemble-and-reassemble-pelikan-nib-units",
          "nib/nibs-pelikan-interchangeability-chart",
        ],
        sources: [
          "source-richardspens-c406335395e6bb38",
          "source-pelikan-collectibles-history",
        ],
      },
      {
        id: "exhibit-pelikan-piston-filler-05",
        title: "从机制进入品牌，而不是反过来",
        body_md: `Pelikan 的故事从活塞机制展开，会比单纯从品牌声望展开更清楚。

- “活塞上墨”解释储墨、密封、旋钮和墨窗。
- Pelikan 品牌馆展示它从墨水/颜料进入钢笔的长期路径。
- M200/M400/M600/M800/M1000 构成了尺寸与定位的样本树。
- 维修和笔尖资料揭开可换笔尖、旧款差异和长期维护。

这样看，Pelikan 不只是“绿条纹很经典”。它是一套围绕活塞、尺寸和可维护性展开的钢笔体系。`,
        related: [
          "concept/piston-filler",
          "brand/pelikan",
          "pen/百利金-pelikan-m800",
          "pen/pelikan-souveran-m800",
        ],
        sources: [
          "source-pelikan-official-history",
          "source-pelikan-collectibles-history",
          "source-richardspens-c995d03855e0283c",
        ],
      },
    ],
  },
  {
    id: "exhibit-filling-system-history",
    slug: "filling-system-history",
    title: "上墨系统小史：从墨囊到活塞与真空",
    summary:
      "用“墨水储在哪里、如何进入笔杆、维护难度如何”这三个问题，串起杠杆、压囊、活塞、真空、墨囊和上墨器。",
    status: "published",
    sections: [
      {
        id: "exhibit-filling-system-history-01",
        title: "先问三个问题：墨水在哪里、怎样进去、怎样维护",
        body_md: `上墨系统不该只是一串术语。对普通用户来说，最有效的入口是三个问题：墨水储存在笔杆、墨囊还是可拆上墨器里；上墨动作靠压囊、旋钮、推杆还是真空释放；清洗和维修会不会困难。

用这三个问题看钢笔，型号之间的差异会立刻清楚。LAMY 2000 和 Pelikan 属于集成活塞逻辑；Pilot Custom 823 和 TWSBI VAC700R 属于真空/负压路径；Safari、#3776 Century 和很多现代钢笔则回到墨囊/上墨器的便利性。`,
        related: [
          "concept/piston-filler",
          "pen/凌美-lamy-lamy-2000",
          "pen/pilot-custom-823",
          "pen/三文堂-twsbi-vac700r",
        ],
        sources: [
          "source-richardspens-2b415662915ed6ee",
          "source-gopens-vintage-fillers",
        ],
      },
      {
        id: "exhibit-filling-system-history-02",
        title: "压囊、杠杆和按钮：让软囊变形",
        body_md: `许多早期和 vintage 钢笔的核心思路，是用外部结构压缩内部墨囊：杠杆、按钮、硬币填充器等名称不同，但都围绕“压缩后释放，墨水被吸入墨囊”展开。它们的优点是结构直观、历史范围广；缺点是墨囊会老化，修复时常要更换橡胶件。

这条路径适合解释为什么 vintage 钢笔不能只看外观。看似完整的一支笔，如果墨囊硬化、压杆损坏或气密性不足，就不能正常上墨。`,
        related: [],
        sources: [
          "source-richardspens-2b415662915ed6ee",
          "source-gopens-vintage-fillers",
        ],
      },
      {
        id: "exhibit-filling-system-history-03",
        title: "活塞：把储墨系统做进笔杆",
        body_md: `活塞系统把储墨空间和机械动作整合进笔杆：旋转尾钮，活塞移动，笔杆内的负压把墨水吸入。它的优点是容量大、结构完整、适合瓶装墨水；代价是清洗较慢，维修需要理解密封和活塞机构。

这也是为什么 Pelikan、LAMY 2000、TWSBI ECO/580 等笔常被拿来比较。它们都使用活塞逻辑，但产品定位完全不同：Pelikan 强调传统和尺寸体系，LAMY 2000 强调现代工具整合，TWSBI 则把透明示范和可见结构带给入门用户。`,
        related: [
          "concept/piston-filler",
          "brand/pelikan",
          "pen/凌美-lamy-lamy-2000",
          "pen/三文堂-twsbi-eco",
          "pen/三文堂-twsbi-580-580al",
        ],
        diagrams: ["piston-filler-mechanism"],
        sources: [
          "source-richardspens-c995d03855e0283c",
          "source-pelikan-collectibles-history",
          "source-lamy-2000-official",
        ],
      },
      {
        id: "exhibit-filling-system-history-04",
        title: "真空和负压：一次推杆动作背后的复杂性",
        body_md: `真空上墨常被用户记住为“推一下吸很多墨”。它的实际逻辑更复杂：推杆移动时形成压力变化，到达特定位置后释放，让墨水进入笔杆。优点是容量大、动作有仪式感；缺点是清洗、维护和旅行时的止墨/气压问题都更需要留意。

Pilot Custom 823、TWSBI VAC700R、Majohn V1 等现代笔让这套机制重新进入日常讨论。它们吸引人的地方不只是容量，也包括透明笔身、推杆动作和止墨结构带来的机械感。真空上墨的“好玩”，正来自这些结构事实和使用体验叠在一起。`,
        related: [
          "pen/pilot-custom-823",
          "pen/三文堂-twsbi-vac700r",
          "pen/末匠-majohn-v1-负压上墨",
        ],
        sources: [
          "source-gopens-vintage-fillers",
          "source-pilot-custom-series",
          "source-pilot-custom-history",
        ],
      },
      {
        id: "exhibit-filling-system-history-05",
        title: "墨囊/上墨器：低容量不等于低级",
        body_md: `墨囊和上墨器常被嫌弃容量小，但它们解决的是另一类问题：换墨方便、清洗简单、旅行省心、维修门槛低。对很多日用钢笔来说，这比容量更重要。Platinum #3776 Century、Sailor 1911/Pro Gear、LAMY Safari/AL-star 等都可以沿这条线阅读。

因此，选择上墨系统不是按“高级/低级”排序，而是按场景排序：长时间书写选大容量，常换颜色选上墨器，喜欢结构可见选透明活塞或真空，追求 vintage 体验再进入压囊和杠杆。`,
        related: [
          "pen/白金-platinum-3776-century",
          "pen/写乐-sailor-1911-profit系列",
          "pen/凌美-lamy-al-star-恒星",
        ],
        sources: [
          "source-richardspens-2b415662915ed6ee",
          "source-platinum-3776-century-official",
          "source-sailor-1911-series-official",
        ],
      },
      {
        id: "exhibit-filling-system-history-06",
        title: "按维护成本重新认识钢笔",
        body_md: `上墨系统会悄悄改变一支钢笔的生活方式。

1. 活塞上墨把笔杆变成储墨空间，容量大，但清洗和维修更依赖结构理解。
2. LAMY 2000 和 Pelikan 展示了活塞如何分别服务现代设计和传统品牌。
3. Pilot Custom 823 与 TWSBI VAC700R 把真空/负压上墨的容量、止墨和清洗成本放到台前。
4. #3776、Sailor 1911、LAMY AL-star 等墨囊/上墨器钢笔提醒用户：便利性也是一种设计选择。

把这些机制放在一起看，术语会变成选择依据：为什么一支笔好清洗，为什么另一支储墨多，为什么某些老笔需要专业维护。`,
        related: [
          "concept/piston-filler",
          "pen/凌美-lamy-lamy-2000",
          "pen/百利金-pelikan-m800",
          "pen/pilot-custom-823",
          "pen/三文堂-twsbi-vac700r",
          "pen/白金-platinum-3776-century",
        ],
        sources: [
          "source-richardspens-2b415662915ed6ee",
          "source-richardspens-c995d03855e0283c",
          "source-gopens-vintage-fillers",
        ],
      },
    ],
  },
  {
    id: "exhibit-chinese-fountain-pen-memory",
    slug: "chinese-fountain-pen-memory",
    title: "中国钢笔记忆：英雄、永生与日常书写",
    summary:
      "从英雄的华孚起点、英雄 100/616 的暗尖记忆、永生的品牌转写和 Wing Sung 601 的复兴语境，梳理国产钢笔如何进入日常书写和玩家讨论。",
    status: "published",
    sections: [
      {
        id: "exhibit-chinese-fountain-pen-memory-01",
        title: "国产钢笔不能只写成怀旧口号",
        body_md: `中国钢笔记忆常常从“老国货”“学生时代”“父辈抽屉里的一支笔”开始。这些记忆真实而有温度，但它们背后还有更具体的层次：品牌沿革、型号身份、生产语境、渠道价格、日用口碑，以及不同年代用户留下的个人经验。

英雄、永生、金星、铃兰、长江等名字不只是怀旧标签。它们分别连接着不同的产地、年代、结构和市场位置。把这些边界看清楚，国产钢笔才会从模糊的情感记忆，变成一张能继续追索的书写地图。`,
        related: ["brand/hero", "brand/wingsung"],
        sources: [
          "source-hero-group-about",
          "source-stdaily-hero-innovation",
          "source-frankunderwater-new-wingsungs",
        ],
      },
      {
        id: "exhibit-chinese-fountain-pen-memory-02",
        title: "英雄：从华孚起点到“赶派克”的工业叙事",
        body_md: `英雄的故事可以从 1931 年华孚金笔厂起点、英雄商标和 1960 年代更名语境读起。科技日报和官方资料都把它放在民族制笔工业、工匠工序和品牌传承的框架里；这比简单说“老牌国产笔”更具体。

英雄 100 和英雄 616 则把这种品牌叙事落到用户手里：暗尖、金属帽、日用笔、学生/办公记忆，以及和 Parker 51 相邻的设计语境。它们让“赶派克”这类工业叙事变得具体：不是抽象口号，而是一支可以握在手里、进入课堂和办公室的日用钢笔。`,
        related: [
          "brand/hero",
          "pen/英雄-hero-100",
          "pen/英雄-hero-616",
          "pen/the-parker-51",
        ],
        sources: [
          "source-hero-group-about",
          "source-hero-group-classic-products",
          "source-stdaily-hero-innovation",
          "source-parker-penography-51",
        ],
      },
      {
        id: "exhibit-chinese-fountain-pen-memory-03",
        title: "永生与 Wing Sung：名称、授权和复兴语境",
        body_md: `永生的复杂性首先来自名称和品牌边界。中文“永生”、英文 Wing Sung、现代授权生产、老库存和新款复兴，经常在玩家语境里交织。FrankUnderwater 的文章把这种现代 Wing Sung 讨论整理成了一个入口：它呈现的不是单一线性品牌史，而是一段由老品牌记忆、授权市场和新款型号共同组成的复兴语境。

Wing Sung 601、601A、618、698 等现代常见型号，也让“永生”从一个品牌名重新变成一组具体产品。它们在上墨方式、外形参考、透明示范和价格区间上各有差异，不能被简单合并成同一种怀旧复兴。`,
        related: [
          "brand/wingsung",
          "pen/永生-wingsung-601",
          "pen/永生-wingsung-601a",
          "pen/永生-wingsung-618",
          "pen/永生-wingsung-698",
        ],
        sources: [
          "source-frankunderwater-new-wingsungs",
          "source-hero-group-about",
        ],
      },
      {
        id: "exhibit-chinese-fountain-pen-memory-04",
        title: "暗尖日用笔：Parker 51 语境在本地市场的再解释",
        body_md: `Hero 100、Hero 616、Wing Sung 601 这类暗尖日用笔，是中国钢笔记忆里最容易被拿来和 Parker 51 对照的一组。这个对照有意义，因为它说明暗尖、金属帽、细线条和稳定日用如何进入本地市场；但也必须避免把它们写成同一技术谱系。

Parker 51 提供了可比较的设计语境，英雄和永生则在本地生产、价格、渠道、质量波动和用户记忆中形成了自己的故事。对很多中国用户来说，暗尖日用笔不是博物馆里的经典，而是练字本、办公桌、礼品盒和文具店柜台里的日常物件。`,
        related: [
          "pen/the-parker-51",
          "pen/英雄-hero-100",
          "pen/英雄-hero-616",
          "pen/永生-wingsung-601",
        ],
        sources: [
          "source-parker-penography-51",
          "source-stdaily-hero-innovation",
          "source-frankunderwater-new-wingsungs",
        ],
      },
      {
        id: "exhibit-chinese-fountain-pen-memory-05",
        title: "社区记忆怎样补上官方资料的空白",
        body_md: `国产钢笔的许多信息不在官方网页里，而在论坛、评测、二手交易标题、包装照片和玩家拆解中。官方资料常常能提供品牌和产品身份，社区材料则补上了另一面：某个批次好不好写，某个版本是否容易漏墨，某个型号曾经卖多少钱，某个包装到底对应哪一代产品。

这些碎片让国产钢笔更接近日常生活。它们未必能单独确认创立年份或官方规格，却能记录使用者真实遇到的问题和偏好。国产钢笔的记忆，正是在官方叙事和社区经验之间慢慢拼起来的。`,
        related: ["brand/hero", "brand/wingsung"],
        sources: [
          "source-stdaily-hero-innovation",
          "source-frankunderwater-new-wingsungs",
        ],
      },
      {
        id: "exhibit-chinese-fountain-pen-memory-06",
        title: "从品牌、型号到个人记忆",
        body_md: `国产钢笔可以沿着四条线索继续展开。

- 英雄品牌馆连接华孚起点、英雄商标、经典型号和工业叙事。
- 英雄 100、英雄 616 把暗尖日用笔和 Parker 51 语境放到同一张比较图上。
- 永生品牌馆与 Wing Sung 601/601A 展示现代复兴和授权市场的复杂关系。
- 社区评价、价格记忆和拆解照片补充了官方资料之外的使用经验。

这些线索放在一起，国产钢笔既保留了“日常书写”的情感，也拥有了更清楚的品牌、型号和证据边界。`,
        related: [
          "brand/hero",
          "brand/wingsung",
          "pen/英雄-hero-100",
          "pen/英雄-hero-616",
          "pen/永生-wingsung-601",
          "pen/永生-wingsung-601a",
        ],
        sources: [
          "source-hero-group-about",
          "source-stdaily-hero-innovation",
          "source-frankunderwater-new-wingsungs",
        ],
      },
    ],
  },
  {
    id: "exhibit-japanese-big-three",
    slug: "japanese-big-three",
    title: "日系三金：日用旗舰与笔尖性格",
    summary:
      "把 Pilot、Platinum、Sailor 放在同一条阅读路径里：不是给品牌排座次，而是比较历史起点、笔尖性格、密封技术、上墨系统和日常旗舰定位。",
    status: "published",
    sections: [
      {
        id: "exhibit-japanese-big-three-01",
        title: "“三金”不是排行榜，而是三种书写哲学",
        body_md: `中文玩家说“日系三金”，通常指 Pilot、Platinum、Sailor 三个日本钢笔品牌。这个说法很适合作为入口，但它不是排行榜。三家都能做金尖日用笔，却把重点放在不同地方：Pilot 常被放在稳定、工程化和产品线完整的语境里；Platinum 很容易从 #3776 与密封笔帽读起；Sailor 则常从 21K 笔尖、1911/Pro Gear 外形和笔尖反馈进入。

同样是金尖日用旗舰，它们写起来、用起来、维护起来都不一样。差异不只在品牌偏好，也在笔尖尺寸、上墨系统、笔帽密封、握持比例和用户对反馈的期待。`,
        related: ["brand/pilot", "brand/platinum", "brand/sailor"],
        sources: [
          "source-pilot-100th-history",
          "source-platinum-100th-history",
          "source-sailor-official-history",
        ],
      },
      {
        id: "exhibit-japanese-big-three-02",
        title: "Pilot：从制造史到 Custom 823 的大容量日用",
        body_md: `Pilot 的官方百年资料把故事放在 Namiki/Wada、早期日本制金笔尖和 1918 年前后建立制造能力的背景里。Custom 系列页面则把“为用户书写方式服务”的产品线逻辑延伸到现代。

Custom 823 适合作为 Pilot 日用旗舰的入口：透明笔身、真空上墨、大容量和 14K 笔尖，让它既是机制样本，也是长时间书写样本。读 823 时，重点不是只夸“顺滑”，而是把真空上墨、墨量、清洗成本和金尖体验放在一起看。`,
        related: [
          "brand/pilot",
          "pen/pilot-custom-823",
          "pen/百乐-pilot-custom-823",
          "pen/百乐-pilot-capless-decimo",
        ],
        sources: [
          "source-pilot-100th-history",
          "source-pilot-custom-series",
          "source-pilot-custom-history",
        ],
      },
      {
        id: "exhibit-japanese-big-three-03",
        title: "Platinum：#3776 Century 和密封笔帽的日用价值",
        body_md: `Platinum 的官方周年资料提供了 1919 年起点和公司发展脉络；#3776 Century 则把品牌读法带到具体产品：它不是只靠“富士山高度命名”被记住，更重要的是 Slip & Seal 这类围绕日用可靠性的设计。

密封笔帽的价值在于降低干尖和闲置风险。对普通用户来说，这可能比材料、限量和装饰更实际：一支笔如果几天不用还能稳定书写，它就更容易成为桌面常驻工具。`,
        related: [
          "brand/platinum",
          "pen/白金-platinum-3776-century",
          "pen/白金-platinum-president",
        ],
        sources: [
          "source-platinum-100th-history",
          "source-platinum-3776-century-official",
          "source-platinum-slip-seal",
        ],
      },
      {
        id: "exhibit-japanese-big-three-04",
        title: "Sailor：1911、Pro Gear 和 21K 笔尖语境",
        body_md: `Sailor 官方历史把 1911 年 Sakata-Manufactory 和金笔尖生产放在起点。现代产品线里，1911 与 Professional Gear 是最适合新用户理解 Sailor 的两条路径：前者是雪茄形传统外观，后者是平顶、锚标和更现代的家族脸。

Sailor 的“笔尖性格”常被玩家描述成铅笔感、阻尼或反馈。把这些词放回产品本身，会更容易理解：1911/Pro Gear 的外形、材料、上墨方式、21K/14K 选项，构成了官方可确认的骨架；用户对笔尖触感的形容，则让这副骨架有了真实书写时的声音。`,
        related: [
          "brand/sailor",
          "pen/写乐-sailor-1911-profit系列",
          "pen/sailor-pro-gear",
          "pen/写乐-sailor-21k-pro-gear-大鱼雷",
        ],
        sources: [
          "source-sailor-official-history",
          "source-sailor-1911-series-official",
          "source-sailor-pro-gear-official",
        ],
      },
      {
        id: "exhibit-japanese-big-three-05",
        title: "把口碑词拆成可比较的问题",
        body_md: `日系三金最常见的讨论词包括“顺滑”“铅笔感”“硬滑”“密封好”“大容量”“适合长写”。这些词只有落到具体问题上，才会真正有用：

- 笔尖材料和尺寸是什么？
- 上墨系统是墨囊/上墨器、活塞还是真空？
- 笔帽密封怎样影响闲置后的启动？
- 长时间书写时，重量、握位和墨量是否合适？
- 玩家口碑来自长期使用、单次试写还是价格期待？

当这些问题被拆开，口碑就不再只是立场。用户可以把“顺滑”拆成笔尖、纸张和墨水，把“适合长写”拆成重量、握位和墨量，把“密封好”拆成闲置后的启动表现。`,
        related: [
          "brand/pilot",
          "brand/platinum",
          "brand/sailor",
          "pen/pilot-custom-823",
          "pen/白金-platinum-3776-century",
          "pen/写乐-sailor-1911-profit系列",
        ],
        sources: [
          "source-pilot-custom-series",
          "source-platinum-3776-century-official",
          "source-sailor-1911-series-official",
        ],
      },
      {
        id: "exhibit-japanese-big-three-06",
        title: "三支样本笔，三种日用答案",
        body_md: `三家品牌各有一支很适合当作入口的样本笔。

- **Pilot Custom 823**：真空上墨、大容量和稳定日用旗舰构成了它的核心印象。
- **Platinum #3776 Century**：14K 笔尖、密封笔帽和日常可靠性让它成为桌面常驻型选择。
- **Sailor 1911 / Pro Gear**：21K/14K 笔尖、外形家族和书写反馈讨论，构成了 Sailor 最典型的入口。

三支样本放在一起，“日系三金”就从标签变成了可比较的书写选择：容量、密封、笔尖反馈、外形比例和长期使用场景，各自给出不同答案。`,
        related: [
          "pen/pilot-custom-823",
          "pen/白金-platinum-3776-century",
          "pen/写乐-sailor-1911-profit系列",
          "pen/sailor-pro-gear",
        ],
        sources: [
          "source-pilot-custom-series",
          "source-platinum-3776-century-official",
          "source-sailor-1911-series-official",
        ],
      },
    ],
  },
];

const FORBIDDEN_PUBLIC_COPY_PATTERNS: Array<[RegExp, string]> = [
  [/应该|应当|应把|应先|不应/, "editorial should/should-not wording"],
  [
    /展览里|展览要|展览的目标|对图书馆|图书馆里|图书馆可以|资料馆/,
    "internal exhibit/library planning wording",
  ],
  [/后续|待补|研究队列|预留展览/, "placeholder or backlog wording"],
  [
    /可以作为|不能写成|要先|建议|推荐读法|最终目标/,
    "agent-facing instruction wording",
  ],
  [/适合放在.*展览/, "exhibit placement instruction wording"],
];

function validateExhibitCopy() {
  const violations: string[] = [];

  for (const exhibit of EXHIBITS) {
    const fields = [
      ["summary", exhibit.summary],
      ...exhibit.sections.flatMap((section) => [
        [`${section.id}.title`, section.title],
        [`${section.id}.body_md`, section.body_md],
      ]),
    ] as Array<[string, string]>;

    for (const [field, value] of fields) {
      for (const [pattern, label] of FORBIDDEN_PUBLIC_COPY_PATTERNS) {
        if (pattern.test(value)) {
          violations.push(`${exhibit.slug}.${field}: ${label}`);
        }
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(`Exhibit copy has public-facing issues:\n${violations.join("\n")}`);
  }
}

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
  }
}

async function upsertSourceRegistry(db: Client, source: SourceRegistrySeed) {
  await execute(
    db,
    `INSERT INTO source_registry
      (id, name, source_type, allowed_use, reliability, license, attribution, homepage_url, fetch_method, notes, last_checked_at, updated_at)
     VALUES (?, ?, ?, ?, ?, NULL, ?, ?, 'manual', ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      source_type = excluded.source_type,
      allowed_use = excluded.allowed_use,
      reliability = excluded.reliability,
      attribution = excluded.attribution,
      homepage_url = excluded.homepage_url,
      notes = excluded.notes,
      last_checked_at = excluded.last_checked_at,
      updated_at = datetime('now')`,
    [
      source.id,
      source.name,
      source.source_type,
      source.allowed_use,
      source.reliability,
      source.attribution,
      source.homepage_url,
      source.notes,
      RETRIEVED_AT,
    ],
  );
}

async function upsertSourceItem(db: Client, item: SourceItemSeed) {
  await execute(
    db,
    `INSERT INTO source_items
      (id, source_id, title, url, item_type, license, author, published_at, retrieved_at, summary, raw_metadata_json, allowed_use, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      source_id = excluded.source_id,
      title = excluded.title,
      url = excluded.url,
      item_type = excluded.item_type,
      license = excluded.license,
      author = excluded.author,
      published_at = excluded.published_at,
      retrieved_at = excluded.retrieved_at,
      summary = excluded.summary,
      allowed_use = excluded.allowed_use,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      item.id,
      item.source_id,
      item.title,
      item.url,
      item.item_type,
      item.license || null,
      item.author || null,
      item.published_at || null,
      RETRIEVED_AT,
      item.summary,
      item.allowed_use,
      item.review_status,
    ],
  );
}

async function upsertExhibit(db: Client, exhibit: ExhibitSeed) {
  await execute(
    db,
    `INSERT INTO exhibits
      (id, slug, title, summary, status, hero_diagram_id, updated_at)
     VALUES (?, ?, ?, ?, ?, NULL, datetime('now'))
     ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      status = excluded.status,
      updated_at = datetime('now')`,
    [exhibit.id, exhibit.slug, exhibit.title, exhibit.summary, exhibit.status],
  );

  const sectionIds = exhibit.sections.map((section) => section.id);
  if (sectionIds.length > 0) {
    const placeholders = sectionIds.map(() => "?").join(", ");
    await execute(
      db,
      `DELETE FROM exhibit_sections
       WHERE exhibit_id = ? AND id NOT IN (${placeholders})`,
      [exhibit.id, ...sectionIds],
    );
  }

  for (const [index, section] of exhibit.sections.entries()) {
    await execute(
      db,
      `INSERT INTO exhibit_sections
        (id, exhibit_id, position, title, body_md, related_entity_slugs_json, diagram_slugs_json, source_item_ids_json, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
        position = excluded.position,
        title = excluded.title,
        body_md = excluded.body_md,
        related_entity_slugs_json = excluded.related_entity_slugs_json,
        diagram_slugs_json = excluded.diagram_slugs_json,
        source_item_ids_json = excluded.source_item_ids_json,
        updated_at = datetime('now')`,
      [
        section.id,
        exhibit.id,
        index,
        section.title,
        section.body_md,
        JSON.stringify(section.related),
        JSON.stringify(section.diagrams || []),
        JSON.stringify(section.sources),
      ],
    );
  }
}

async function main() {
  validateExhibitCopy();

  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");
  if (WRITE) await runMigrations(db);

  console.log(
    WRITE
      ? "Exhibit content import: write mode"
      : "Exhibit content import: dry run",
  );
  console.log(
    `${SOURCE_REGISTRIES.length} source registries, ${SOURCE_ITEMS.length} source items, ${EXHIBITS.length} exhibits`,
  );

  if (!WRITE) {
    for (const exhibit of EXHIBITS) {
      console.log(`${exhibit.slug}: ${exhibit.sections.length} sections`);
    }
    console.log("Dry run only. Re-run with --write to store exhibit content.");
    return;
  }

  for (const source of SOURCE_REGISTRIES) {
    await upsertSourceRegistry(db, source);
  }
  for (const item of SOURCE_ITEMS) {
    await upsertSourceItem(db, item);
  }
  for (const exhibit of EXHIBITS) {
    await upsertExhibit(db, exhibit);
    console.log(`${exhibit.slug}: published with ${exhibit.sections.length} sections`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
