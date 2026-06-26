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
        body_md: `LAMY 2000 的故事要从“它为什么还没有显老”开始读。官方产品页把 1966 年、Gerd A. Müller、设计史和工程性放在同一组叙述里；这说明 LAMY 2000 不是靠怀旧维持辨识度，而是靠一套很稳定的产品约束：少装饰、少接缝、少视觉噪音，但功能完整。

这也是它和许多复古钢笔不同的地方。Parker 51 或 Pelikan 100 常常带着时代材料和上墨系统的历史痕迹；LAMY 2000 则更像一件现代工业产品：用户首先感到的是比例、触感、重心和动作是否顺手，然后才意识到它已经存在了几十年。`,
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
        body_md: `LAMY 2000 的“低调”不是单纯把颜色做黑，而是把材料处理成连续的手感。官方资料给出的核心组合是纤维增强聚碳酸酯语境的笔身、拉丝不锈钢部件、外弹簧笔夹和活塞上墨结构。现代用户评论里反复出现的也是这些触点：磨砂表面、金属握位、半包尖和墨窗。

所以这支笔适合放在“材料如何塑造使用感”的展览里，而不是只写成“包豪斯风”。它的设计重点并不在于让人远看觉得漂亮，而在于让使用者在握持、旋开、吸墨、观察余墨、收入口袋时都感觉少一步摩擦。`,
        related: ["pen/凌美-lamy-lamy-2000"],
        sources: [
          "source-lamy-2000-official",
          "source-lamy-2000-gentlemanstationer",
        ],
      },
      {
        id: "exhibit-lamy-2000-modernism-03",
        title: "半包尖和活塞：一支日用工具的隐藏工程",
        body_md: `LAMY 2000 的半包尖让视觉中心从笔尖转移到笔身整体。它不像开放式大金尖那样把书写身份摆在最前面，而是把笔尖、握位和笔身做成更连续的工具形态。配合活塞上墨，它也天然要求用户用瓶装墨水，而不是把它当一次性消耗品。

活塞结构在这里的意义不只是“储墨多”。它让 LAMY 2000 保持了一个完整、封闭、可长期维护的工具逻辑：笔杆本身就是储墨系统，墨窗提供余量信息，笔尾旋钮负责动作反馈。对新用户来说，这是一条从现代设计进入上墨机制的好路径。`,
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
        body_md: `LAMY 2000 的口碑有一个有趣的反差：图片上它可能显得过于安静，拿在手里却很容易让人理解它的长期生命力。许多现代评论不是把它当作最华丽的钢笔，而是把它当作一支完成度很高的日常工具来谈：握持、平衡、墨量、耐看程度和长时间使用的一致性。

这类口碑不能写成硬事实，但可以作为“用户如何理解设计”的材料。展览里应把它放在事实之后：官方资料负责说明材料、结构和设计归属；评论资料负责说明这些设计在实际使用中如何被感知。`,
        related: ["pen/凌美-lamy-lamy-2000"],
        sources: [
          "source-lamy-2000-official",
          "source-lamy-2000-gentlemanstationer",
        ],
      },
      {
        id: "exhibit-lamy-2000-modernism-05",
        title: "阅读路径：从 2000 回到 LAMY 的产品谱系",
        body_md: `读完 LAMY 2000，可以沿三条线继续走。

- **品牌线**：进入 LAMY 品牌馆，看 LAMY 如何把设计一致性变成品牌识别。
- **入门线**：比较 Safari、AL-star 与 Studio，理解 LAMY 的人体工学、材料和价格层级。
- **机制线**：把 LAMY 2000 放到活塞上墨路径里，与 Pelikan、TWSBI、Pilot Custom 823 等更强调储墨量或透明结构的笔比较。

这样读，LAMY 2000 不再只是“签字笔天花板”这类口号，而是一件能把设计、材料和上墨机制连接起来的现代工具。`,
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
        body_md: `Parker 51 不是一个可以用一句“经典暗尖”概括的对象。它至少包含几个层次：1940 年代进入市场的 vintage 主线、早期 Vacumatic 上墨版本、后来的 Aero-metric 版本、不同年代和产地的细节差异，以及现代复刻产品。

如果不先拆开这些对象，内容很容易滑向两种误写：把 vintage 51 的历史声望套到复刻上，或者把复刻的当代体验反过来评价整个 Parker 51 家族。展览的第一条规则就是：先问“是哪一个 Parker 51”。`,
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
        body_md: `Parker 51 的代际差异，最适合从上墨系统读。早期 51 借用了 Parker Vacumatic 的储墨和隔膜语境，容量和历史味道都强，但维护、清洗和修复门槛更高。Aero-metric 版本则把用户体验推向更直接、更日用的方向。

对收藏者而言，这种差异影响年代判断、修复成本和使用风险；对普通用户而言，它影响的是“买一支 vintage 51 来日用”是否轻松。展览里不应把 Vacumatic 与 Aero-metric 只写成名词，而要把它们连接到清洗、换墨、维修和可持续使用。`,
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
        body_md: `Parker 51 的视觉记忆来自暗尖，但真正让它成为一个工程故事的，是暗尖、收集器、笔舌和上墨系统共同构成的供墨结构。它把传统开放式笔尖的存在感压低，让用户看到的是更流线、更封闭、更现代的笔身。

这种外形后来影响了许多暗尖日用笔的想象，包括中国用户熟悉的 Hero 100、Hero 616、Wing Sung 601 等。比较这些笔时，应该写“设计语境和使用记忆相邻”，而不是轻率地把所有暗尖笔都写成同一支笔的复制品。`,
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
        body_md: `“Parker 51”这个名字太响亮，所以复刻产品天然背负期待。对图书馆来说，复刻页最重要的工作不是判断它“值不值”，而是把它放回正确位置：它是现代市场对 51 造型和品牌记忆的再利用，不是 vintage 51 本体的简单延续。

因此，现代复刻的笔尖、上墨方式、材质、价格和品控评价都应该用当代来源来写；vintage 51 的版本、年代、修复和收藏价值则用专业历史/维修来源来写。两套证据不能混用。`,
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
        title: "阅读路径：从一个神话进入多个档案",
        body_md: `读 Parker 51，建议按这样的顺序：

1. 先读 Parker 品牌馆，理解 Parker 如何用 Duofold、Vacumatic 和 51 建立型号神话。
2. 再读 The Parker 51 主档，把 vintage 版本、修复和结构词汇建立起来。
3. 然后读现代复刻页，单独判断当代产品。
4. 最后把 Hero 100、Hero 616、Wing Sung 601 等暗尖日用笔放进“设计影响与本地记忆”的路径里，而不是简单归入仿品叙事。

这条路径能避免把“历史经典”“当代复刻”“国产暗尖记忆”混成一团。`,
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
        body_md: `Pelikan 的入口不应只写成“德国活塞代表”。官方历史把它的起点放在 1838 传统日期、墨水和颜料业务、商标注册、学校书写用品和后来的钢笔产品之间。也就是说，Pelikan 的钢笔史是在更长的书写材料史里长出来的。

这点很重要：当用户看到 Souverän 或 M800 时，容易直接想到高端钢笔；但 Pelikan 同时也属于墨水、学校书写、教育用品和办公材料的世界。展览应让这些层次同时存在。`,
        related: ["brand/pelikan"],
        sources: [
          "source-pelikan-official-history",
          "source-pelikan-collectibles-history",
        ],
      },
      {
        id: "exhibit-pelikan-piston-filler-02",
        title: "1929：活塞不是卖点词，而是使用方式的改变",
        body_md: `1929 年的 Pelikan fountain pen 是这个展览的核心节点。官方和收藏资料都把 1929 与第一支 Pelikan 钢笔、透明视窗/绿纹识别和差动活塞语境联系起来。它的意义不只是“储墨多”，而是把上墨动作从滴管、压囊和复杂部件中解放出来，让旋转尾钮成为用户能理解的日常动作。

所以读 Pelikan，要先读机制：活塞怎样移动，为什么需要密封，墨窗为什么重要，为什么老笔维护和新笔体验不能只用一个词概括。`,
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
        body_md: `Pelikan 现代用户最常遇到的是 M 系列和 Souverän 尺寸梯度：M200、M400、M600、M800、M1000 等名称看起来像线性升级，但实际牵涉尺寸、重量、笔尖、握持和价格定位。M800 不是所有人的终点，M1000 也不是简单“更高级”，而是更大、更软、更强个性的选择。

因此，展览要把 Pelikan 型号做成一棵“尺寸树”，而不是排行榜。用户应该能从手长、书写压力、是否喜欢湿润出墨、是否需要大尺寸和是否愿意维护活塞来选择阅读路径。`,
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
        body_md: `Pelikan 的可拆笔尖单元和活塞结构让它很适合进入“可维护钢笔”的讨论。Richard's Pens 的维修资料可以帮助用户理解：老 Pelikan、新 Pelikan、不同笔尖单元之间并不总是完全互通，拆装和替换也要尊重年代和规格边界。

这类信息对图书馆很有价值，因为它把“好写”之外的问题带出来：一支钢笔能否长期使用，取决于结构、零件供应、维修难度和资料是否清楚。`,
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
        title: "阅读路径：从机制进入品牌，而不是反过来",
        body_md: `Pelikan 的推荐阅读顺序是：

- 先读“活塞上墨”，弄清储墨、密封、旋钮和墨窗。
- 再读 Pelikan 品牌馆，理解它从墨水/颜料进入钢笔的长期路径。
- 然后进入 M 系列尺寸树，用 M200/M400/M600/M800/M1000 观察尺寸与定位。
- 最后读维修和笔尖资料，理解可换笔尖、旧款差异和长期维护。

这样读，Pelikan 就不只是“绿条纹很经典”，而是一套围绕活塞、尺寸和可维护性展开的钢笔体系。`,
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
        body_md: `真空上墨常被用户记住为“推一下吸很多墨”。它的实际逻辑更复杂：推杆移动时形成压力变化，到达特定位置后释放，让墨水进入笔杆。优点是容量大、动作有仪式感；缺点是清洗、维护和旅行时的止墨/气压问题都更需要说明。

Pilot Custom 823、TWSBI VAC700R、Majohn V1 等现代笔让这套机制重新进入日常讨论。图书馆里应把“好玩”和“事实”分开：哪些是结构事实，哪些是用户喜欢的体验，哪些需要拆解或长期评测来支撑。`,
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
        title: "阅读路径：按维护成本重新认识钢笔",
        body_md: `这条展览的推荐读法是：

1. 从活塞上墨概念页进入，理解笔杆储墨。
2. 读 LAMY 2000 和 Pelikan，观察活塞如何分别服务现代设计和传统品牌。
3. 读 Pilot Custom 823 与 TWSBI VAC700R，理解真空/负压上墨的容量和清洗成本。
4. 回到 #3776、Sailor 1911、LAMY AL-star 等墨囊/上墨器钢笔，理解便利性为什么也是一种设计选择。

最终目标不是背术语，而是知道一支笔为什么好清洗、为什么储墨多、为什么需要专业维护。`,
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
        body_md: `中国钢笔记忆很容易被写成“老国货”“学生时代”“父辈抽屉里的一支笔”。这些记忆重要，但不能替代事实。展览要先建立证据等级：官方资料和新闻报道用于品牌和生产史，产品页用于型号身份，论坛和评测用于使用口碑，社区回忆则标注为记忆材料。

这样处理，英雄、永生、金星、铃兰、长江等品牌才不会被混成一段模糊的怀旧叙事。图书馆的价值，正是在情感之外把品牌、型号、产地、年代和结构边界拆出来。`,
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

英雄 100 和英雄 616 则把这种品牌叙事落到用户手里：暗尖、金属帽、日用笔、学生/办公记忆，以及和 Parker 51 的相似设计语境。这里要谨慎：可以写设计影响和用户比较，但不能把每个相似外形都写成同一套历史来源。`,
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
        body_md: `永生的难点在名称和品牌边界。中文“永生”、英文 Wing Sung、现代授权生产、老库存和新款复兴，经常在玩家语境里交织。FrankUnderwater 的文章可以作为理解现代 Wing Sung 讨论的入口，但它仍是二级资料，适合用来解释市场语境，而不是单独证明所有历史细节。

因此，永生页要特别重视别名和型号拆分。Wing Sung 601、601A、618、698 等现代常见型号，应按结构和来源逐个写，而不是把“永生复兴”写成一个统一事实包。`,
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

更稳妥的写法是：Parker 51 提供了可比较的设计语境，英雄和永生则在本地生产、价格、渠道、质量波动和用户记忆中形成了自己的故事。`,
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
        title: "社区记忆怎样进入图书馆",
        body_md: `国产钢笔的许多信息不在官方网页里，而在论坛、评测、二手交易标题、包装照片和玩家拆解中。图书馆可以使用这些材料，但要给它们合适的位置：它们适合记录口碑、价格印象、版本线索和常见问题，不适合单独确认创立年份、官方型号或材料规格。

这也是为什么一些低资料条目仍应保留“证据边界”。不是内容不重要，而是需要先确认名称、版本和来源等级，避免用流行说法制造伪精确。`,
        related: ["brand/hero", "brand/wingsung"],
        sources: [
          "source-stdaily-hero-innovation",
          "source-frankunderwater-new-wingsungs",
        ],
      },
      {
        id: "exhibit-chinese-fountain-pen-memory-06",
        title: "阅读路径：从品牌、型号到个人记忆",
        body_md: `建议按这个顺序阅读国产钢笔：

- 先读英雄品牌馆，建立华孚、英雄、经典型号和工业叙事。
- 再读英雄 100、英雄 616，把暗尖日用笔和 Parker 51 语境拆开比较。
- 然后读永生品牌馆和 Wing Sung 601/601A，理解现代复兴和授权市场语境。
- 最后再看社区评价和价格记忆，把它们作为口碑材料，而不是历史事实。

这样，国产钢笔既保留“日常书写”的情感，也不会牺牲资料馆的可信度。`,
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
        body_md: `中文玩家说“日系三金”，通常指 Pilot、Platinum、Sailor 三个日本钢笔品牌。这个说法适合做入口，但不适合变成排名。三家都能做金尖日用笔，但重点不同：Pilot 常被放在稳定、工程化和产品线完整的语境里；Platinum 很适合从 #3776 与密封笔帽读；Sailor 则常从 21K 笔尖、1911/Pro Gear 外形和笔尖反馈进入。

展览的目标不是判断谁更高级，而是帮助用户理解：同样是金尖日用旗舰，它们为什么写起来、用起来、维护起来都不一样。`,
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

Sailor 的“笔尖性格”很容易被玩家写成玄学。图书馆里应先写可证事实：1911/Pro Gear 的外形、材料、上墨方式、21K/14K 选项；再把“铅笔感”“阻尼”“反馈”等玩家词汇放入社区口碑层，而不是当成官方规格。`,
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
        body_md: `日系三金最常见的讨论词是“顺滑”“铅笔感”“硬滑”“密封好”“大容量”“适合长写”。这些词有用，但必须被拆成可比较的问题：

- 笔尖材料和尺寸是什么？
- 上墨系统是墨囊/上墨器、活塞还是真空？
- 笔帽密封怎样影响闲置后的启动？
- 长时间书写时，重量、握位和墨量是否合适？
- 玩家口碑来自长期使用、单次试写还是价格期待？

这样处理，用户才能把口碑转化为选择依据，而不是被品牌神话牵着走。`,
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
        title: "阅读路径：三家各选一支样本笔",
        body_md: `入门阅读可以先各选一支样本：

- **Pilot Custom 823**：看真空上墨、大容量和稳定日用旗舰。
- **Platinum #3776 Century**：看 14K 笔尖、密封笔帽和日常可靠性。
- **Sailor 1911 / Pro Gear**：看 21K/14K 笔尖、外形家族和书写反馈讨论。

读完样本笔，再回到品牌馆和更高/更低价位型号。这样，“日系三金”就从标签变成一套可比较的书写选择。`,
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
