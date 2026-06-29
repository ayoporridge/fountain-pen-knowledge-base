import { createClient, type Client, type InArgs } from "@libsql/client";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const REVIEW_PATH = path.join(
  process.cwd(),
  "docs/content/read-first-sample-humanizer-review.md",
);
const SAMPLE_MIN_CHARS = 2000;

type SourceType =
  | "official"
  | "wikimedia"
  | "book"
  | "patent"
  | "blog"
  | "forum"
  | "reddit"
  | "retailer"
  | "user_submission";

type SourceDef = {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceType: SourceType;
  reliability:
    | "high_for_basic_facts"
    | "high_for_model_history"
    | "official_marketing"
    | "community_opinion"
    | "bibliographic"
    | "technical_primary"
    | "medium"
    | "unknown";
  homepageUrl: string;
  title: string;
  url: string;
  itemType: string;
  summary: string;
  relationType?: "reference" | "review" | "history" | "official";
};

type SampleArticle = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  sourceIds: string[];
  humanizer: {
    directness: number;
    rhythm: number;
    trust: number;
    authenticity: number;
    concision: number;
    notes: string;
  };
};

const BANNED_PATTERNS: Array<[RegExp, string]> = [
  [/有人说.*有人说.*还有人说/s, "有人说三连"],
  [/不是[^。；\n]{0,80}而是/s, "不是而是"],
  [/不仅[^。；\n]{0,80}而且/s, "不仅而且"],
  [/型号档案记录了|现有来源包括|优先按实物图|日用性可以从这些结构入手/, "后台资料卡话术"],
  [/作为[^。；\n]{0,80}(体现|证明|提醒|标志)/, "作为体现类句式"],
  [/标志着|见证了|至关重要|关键作用|持久影响|复杂格局/, "AI 抽象意义词"],
  [/值得注意的是|此外|然而|总的来说|综上/, "AI 连接词"],
  [/很多人认为|行业专家指出|一些批评者认为|多个来源显示/, "模糊归因"],
];

const SOURCES: SourceDef[] = [
  {
    id: "source-rfp-richardspens-parker-51",
    sourceId: "richardspens",
    sourceName: "RichardsPens.com",
    sourceType: "blog",
    reliability: "high_for_model_history",
    homepageUrl: "https://richardspens.com/",
    title: "RichardsPens.com: The Parker 51",
    url: "https://www.richardspens.com/ref/profiles/51.htm",
    itemType: "model_profile",
    summary: "Richard Binder profile for Parker 51 design, filling systems, versions, and collector context.",
    relationType: "history",
  },
  {
    id: "source-rfp-parker51-history",
    sourceId: "parker51-com",
    sourceName: "Parker51.com",
    sourceType: "blog",
    reliability: "high_for_model_history",
    homepageUrl: "https://parker51.com/",
    title: "Parker51.com: 51 History",
    url: "https://parker51.com/index.php/education/51-history/",
    itemType: "model_history",
    summary: "Parker 51 history page used for dating, name context, and Vacumatic/Aerometric reading path.",
    relationType: "history",
  },
  {
    id: "source-rfp-penaddict-parker-51",
    sourceId: "pen-addict",
    sourceName: "The Pen Addict",
    sourceType: "blog",
    reliability: "community_opinion",
    homepageUrl: "https://www.penaddict.com/",
    title: "The Pen Addict: The Parker 51",
    url: "https://www.penaddict.com/blog/2016/7/7/the-parker-51",
    itemType: "review_article",
    summary: "Hands-on article for daily-writing context and modern user appeal of the Parker 51.",
    relationType: "review",
  },
  {
    id: "source-rfp-lamy-2000-official",
    sourceId: "lamy",
    sourceName: "LAMY official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://www.lamy.com/",
    title: "LAMY 2000 fountain pen",
    url: "https://www.lamy.com/en-us/p/lamy-2000-fountain-pen",
    itemType: "official_product_page",
    summary: "Official LAMY 2000 product page for Makrolon body, piston filling, platinum-coated 14K nib, and design language.",
    relationType: "official",
  },
  {
    id: "source-rfp-lamy-design",
    sourceId: "lamy",
    sourceName: "LAMY official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://www.lamy.com/",
    title: "The LAMY Design",
    url: "https://www.lamy.com/en-us/company/design",
    itemType: "official_brand_history",
    summary: "LAMY design page for brand design approach and historical context around LAMY 2000.",
    relationType: "official",
  },
  {
    id: "source-rfp-gentleman-lamy-2000",
    sourceId: "gentleman-stationer",
    sourceName: "The Gentleman Stationer",
    sourceType: "blog",
    reliability: "community_opinion",
    homepageUrl: "https://www.gentlemanstationer.com/",
    title: "The Gentleman Stationer: Lamy 2000 review",
    url: "https://www.gentlemanstationer.com/blog/2017/7/1/pen-review-lamy-2000-fountain-pen",
    itemType: "review_article",
    summary: "Long-form use review for LAMY 2000 ergonomics, nib feel, and daily writing positioning.",
    relationType: "review",
  },
  {
    id: "source-rfp-lamy-logo-official-family",
    sourceId: "lamy",
    sourceName: "LAMY official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://www.lamy.com/",
    title: "LAMY logo series page",
    url: "https://www.lamy.com/en-us/p/lamy-logo-ballpoint-pen",
    itemType: "official_product_family",
    summary: "Official Logo-family page used for series design language only; fountain-pen specifics are checked against review and retail sources.",
    relationType: "official",
  },
  {
    id: "source-rfp-goulet-lamy-logo",
    sourceId: "goulet",
    sourceName: "Goulet Pens",
    sourceType: "blog",
    reliability: "community_opinion",
    homepageUrl: "https://www.gouletpens.com/",
    title: "LAMY logo Fountain Pen: Quick Look",
    url: "https://www.gouletpens.com/blogs/fountain-pen-blog/lamy-logo-quick-look",
    itemType: "review_article",
    summary: "Quick-look review source for LAMY Logo fountain-pen materials, grip, nib, and daily-use positioning.",
    relationType: "review",
  },
  {
    id: "source-rfp-wellappointed-lamy-logo",
    sourceId: "well-appointed-desk",
    sourceName: "The Well-Appointed Desk",
    sourceType: "blog",
    reliability: "community_opinion",
    homepageUrl: "https://www.wellappointeddesk.com/",
    title: "Review: Lamy Logo F Fountain Pen in Brushed Aluminum",
    url: "https://www.wellappointeddesk.com/2014/06/review-lamy-logo-f-fountain-pen-in-brushed-aluminum/",
    itemType: "review_article",
    summary: "Hands-on review for LAMY Logo brushed aluminum body, ridged grip area, LAMY nib compatibility, and user fit.",
    relationType: "review",
  },
  {
    id: "source-rfp-pilot-custom-823-official",
    sourceId: "pilot-usa",
    sourceName: "Pilot Pen USA",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://pilotpen.us/",
    title: "Pilot Custom 823 fountain pen",
    url: "https://pilotpen.us/Product?0=41&1=72&cid=100154",
    itemType: "official_product_page",
    summary: "Official Pilot Custom 823 product page for vacuum filling, 14K nib, and Custom series positioning.",
    relationType: "official",
  },
  {
    id: "source-rfp-goulet-custom-823",
    sourceId: "goulet-pens",
    sourceName: "Goulet Pens",
    sourceType: "retailer",
    reliability: "high_for_basic_facts",
    homepageUrl: "https://www.gouletpens.com/",
    title: "Goulet Pens: Pilot Custom 823",
    url: "https://www.gouletpens.com/products/pilot-custom-823-fountain-pen-amber",
    itemType: "retailer_product_page",
    summary: "Retail product page for Custom 823 colors, nib choices, and vacuum-filling buyer context.",
    relationType: "reference",
  },
  {
    id: "source-rfp-platinum-3776-official",
    sourceId: "platinum-pen-usa",
    sourceName: "Platinum Pen USA",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://platinumpenusa.com/",
    title: "Platinum Pen USA: #3776 Century Collection",
    url: "https://platinumpenusa.com/luxury-writing/3776-collection/",
    itemType: "official_product_family",
    summary: "Official collection page for #3776 Century, 14K nibs, Slip & Seal cap, and Mount Fuji naming.",
    relationType: "official",
  },
  {
    id: "source-rfp-goulet-3776",
    sourceId: "goulet-pens",
    sourceName: "Goulet Pens",
    sourceType: "retailer",
    reliability: "high_for_basic_facts",
    homepageUrl: "https://www.gouletpens.com/",
    title: "Goulet Pens: Platinum 3776 Century",
    url: "https://www.gouletpens.com/collections/platinum-3776-century-fountain-pens",
    itemType: "retailer_collection",
    summary: "Retail collection source for #3776 Century nib options, colors, and modern buyer context.",
    relationType: "reference",
  },
  {
    id: "source-rfp-sailor-progear-official",
    sourceId: "sailor",
    sourceName: "Sailor official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://en.sailor.co.jp/",
    title: "Sailor: Professional Gear Series",
    url: "https://en.sailor.co.jp/topics/professional-gear-series/",
    itemType: "official_product_family",
    summary: "Official Professional Gear series page for flat-top design, size family, and nib family context.",
    relationType: "official",
  },
  {
    id: "source-rfp-sailor-1911-official",
    sourceId: "sailor",
    sourceName: "Sailor official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://en.sailor.co.jp/",
    title: "Sailor: 1911 Series",
    url: "https://en.sailor.co.jp/topics/1911-series/",
    itemType: "official_product_family",
    summary: "Official 1911 series page used to compare cigar-shaped 1911 with flat-top Professional Gear.",
    relationType: "official",
  },
  {
    id: "source-rfp-sailor-1911s-14k",
    sourceId: "sailor",
    sourceName: "Sailor official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://en.sailor.co.jp/",
    title: "Sailor: 1911 S Fountain Pen 14K",
    url: "https://en.sailor.co.jp/product/11-1219/",
    itemType: "official_product_page",
    summary: "Official 1911 S 14K page used for Profit/1911 small-size, cartridge-converter structure, and nib-family context.",
    relationType: "official",
  },
  {
    id: "source-rfp-sailor-1911s-21k",
    sourceId: "sailor",
    sourceName: "Sailor official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://en.sailor.co.jp/",
    title: "Sailor: 1911 S Fountain Pen 21K",
    url: "https://en.sailor.co.jp/product/11-1521/",
    itemType: "official_product_page",
    summary: "Official 1911 S 21K page used to separate 21K Profit evidence from Pro Gear naming and limited-color assumptions.",
    relationType: "official",
  },
  {
    id: "source-rfp-montblanc-149-official",
    sourceId: "montblanc",
    sourceName: "Montblanc official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://www.montblanc.com/",
    title: "Montblanc Meisterstück The Origin Collection 149 Fountain Pen",
    url: "https://www.montblanc.com/en-ro/meisterstuck-the-origin-collection-149-fountain-pen-MB131336.html",
    itemType: "official_product_page",
    summary: "Official Montblanc 149 product page for Meisterstück positioning, piston filling, and high-end materials.",
    relationType: "official",
  },
  {
    id: "source-rfp-gentleman-montblanc-149",
    sourceId: "gentleman-stationer",
    sourceName: "The Gentleman Stationer",
    sourceType: "blog",
    reliability: "community_opinion",
    homepageUrl: "https://www.gentlemanstationer.com/",
    title: "The Gentleman Stationer: Montblanc Meisterstück 149",
    url: "https://www.gentlemanstationer.com/blog/2015/9/7/pen-review-montblanc-meisterstuck-149",
    itemType: "review_article",
    summary: "Hands-on review context for Montblanc 149 size, writing feel, and daily-use tradeoffs.",
    relationType: "review",
  },
  {
    id: "source-rfp-pelikan-m800-official",
    sourceId: "pelikan",
    sourceName: "Pelikan official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://www.pelikan.com/",
    title: "Pelikan Souverän M800 fountain pen",
    url: "https://www.pelikan.com/int/products/writing/fine-writing-instruments/souveraen/301017-souveraen-m800-fountain-pen.html",
    itemType: "official_product_page",
    summary: "Official Pelikan Souverän M800 page for striped body, piston filling, and 18K nib positioning.",
    relationType: "official",
  },
  {
    id: "source-rfp-pelikan-collectibles-m800",
    sourceId: "pelikan-collectibles",
    sourceName: "Pelikan Collectibles",
    sourceType: "blog",
    reliability: "high_for_model_history",
    homepageUrl: "https://www.pelikan-collectibles.com/",
    title: "Pelikan Collectibles: Souverän M800",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M800-Basis/index.html",
    itemType: "model_history",
    summary: "Specialist reference for Pelikan M800 model history, variants, and collector distinctions.",
    relationType: "history",
  },
  {
    id: "source-rfp-noodlers-standard-flex-official",
    sourceId: "noodlers-ink",
    sourceName: "Noodler's Ink official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://noodlersink.com/",
    title: "Noodler's Standard Flex Nibs",
    url: "https://noodlersink.com/product-category/pens/standard-flex-nibs-pens/",
    itemType: "official_product_family",
    summary: "Official Noodler's product-category page for Standard Creaper flex pens, ebonite-feed language, piston filling, and bottled-ink positioning.",
    relationType: "official",
  },
  {
    id: "source-rfp-goulet-noodlers-nib-creaper",
    sourceId: "goulet",
    sourceName: "Goulet Pens",
    sourceType: "retailer",
    reliability: "medium",
    homepageUrl: "https://www.gouletpens.com/",
    title: "Noodler's Nib Creaper Flex Fountain Pens",
    url: "https://www.gouletpens.com/collections/noodlers-nib-creaper-fountain-pens",
    itemType: "retailer_collection",
    summary: "Retail collection page for Noodler's Nib Creaper as a slender piston-filling resin fountain pen with a smaller flexible steel nib.",
    relationType: "reference",
  },
  {
    id: "source-rfp-wonderpens-noodlers-nib-creaper",
    sourceId: "wonder-pens",
    sourceName: "Wonder Pens",
    sourceType: "blog",
    reliability: "community_opinion",
    homepageUrl: "https://wonderpens.wordpress.com/",
    title: "Noodler's Nib Creaper Flex Fountain Pen Review",
    url: "https://wonderpens.wordpress.com/2013/05/25/noodlers-nib-creaper-flex-fountain-pen-review/",
    itemType: "review_article",
    summary: "Hands-on review for Nib Creaper flex nib expectations, piston mechanism, ink window, posted use, and beginner caveats.",
    relationType: "review",
  },
  {
    id: "source-rfp-kaweco-sport-official",
    sourceId: "kaweco",
    sourceName: "Kaweco official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://www.kaweco-pen.com/",
    title: "Kaweco: Classic Sport",
    url: "https://www.kaweco-pen.com/en/Series/CLASSIC-SPORT/",
    itemType: "official_product_page",
    summary: "Official Classic Sport page for pocket size, octagonal cap, and cartridge-based everyday use.",
    relationType: "official",
  },
  {
    id: "source-rfp-kaweco-history",
    sourceId: "kaweco",
    sourceName: "Kaweco official site",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://www.kaweco-pen.com/",
    title: "Kaweco History",
    url: "https://www.kaweco-pen.com/en/service/history/",
    itemType: "official_brand_history",
    summary: "Official Kaweco history page used for Sport family background and historical naming context.",
    relationType: "history",
  },
  {
    id: "source-rfp-platinum-izumo-official",
    sourceId: "platinum-pen-usa",
    sourceName: "Platinum Pen USA",
    sourceType: "official",
    reliability: "official_marketing",
    homepageUrl: "https://platinumpenusa.com/",
    title: "Platinum Pen USA: Izumo Collection",
    url: "https://platinumpenusa.com/luxury-writing/izumo-collection/",
    itemType: "official_product_family",
    summary: "Official Izumo collection page for 18K nibs, PIZ variants, and Japanese craft positioning.",
    relationType: "official",
  },
  {
    id: "source-rfp-endlesspens-izumo",
    sourceId: "endlesspens",
    sourceName: "EndlessPens",
    sourceType: "retailer",
    reliability: "high_for_basic_facts",
    homepageUrl: "https://endlesspens.com/",
    title: "EndlessPens: Platinum Izumo 18K",
    url: "https://endlesspens.com/products/platinum-fountain-pen-izumo-18k-nib",
    itemType: "retailer_product_page",
    summary: "Retail spec page for Izumo 18K materials, filling mechanism, and modern product photos.",
    relationType: "reference",
  },
  {
    id: "source-rfp-richardspens-snorkel",
    sourceId: "richardspens",
    sourceName: "RichardsPens.com",
    sourceType: "blog",
    reliability: "high_for_model_history",
    homepageUrl: "https://richardspens.com/",
    title: "RichardsPens.com: Sheaffer's Snorkel",
    url: "https://www.richardspens.com/ref/profiles/snorkel.htm",
    itemType: "model_profile",
    summary: "Specialist profile for Sheaffer Snorkel filling system, model history, variants, and service complexity.",
    relationType: "history",
  },
  {
    id: "source-rfp-penhero-snorkel",
    sourceId: "penhero",
    sourceName: "PenHero",
    sourceType: "blog",
    reliability: "high_for_model_history",
    homepageUrl: "https://www.penhero.com/",
    title: "PenHero: Sheaffer Snorkel",
    url: "https://www.penhero.com/PenGallery/Sheaffer/SheafferSnorkel.htm",
    itemType: "model_history",
    summary: "PenHero model history and visual reference for Sheaffer Snorkel family and variants.",
    relationType: "history",
  },
];

const ARTICLES: SampleArticle[] = [
  {
    slug: "派克-parker-51-经典-vintage",
    title: "Parker 51：把钢笔变成随手可用的工具",
    summary: "Parker 51 的重点在暗尖、Lucite 笔身和 Vacumatic/Aerometric 上墨，它把老式钢笔从需要照看的物件推向了更省心的日用工具。",
    sourceIds: [
      "source-rfp-richardspens-parker-51",
      "source-rfp-parker51-history",
      "source-rfp-penaddict-parker-51",
    ],
    humanizer: {
      directness: 10,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "去掉了资料卡语气，保留版本和使用判断；没有否定式排比或三段式观点列举。",
    },
    body: `一支老 Parker 51 最容易让人记住的地方，往往不是它的笔尖。你把笔帽拔开，看到的只是一个小小的金属触点，真正的笔尖藏在前端的壳里。第一次用惯明尖的人会有点不适应，像拿了一支没有表情的笔。落到纸上才明白它的思路：少给你看一点，少让墨水暴露一点，也少让你为钢笔操心一点。

Parker 51 在 1940 年代进入市场。Parker51.com 和 Richard Binder 的资料都把它放在 Parker 最重要的产品线里读：研发时间长，量产时间久，版本也多。它的名字和 Parker 的公司纪念年份有关，也足够短，放在任何广告里都醒目。那不是一个靠华丽装饰取胜的年代。二战前后的美国钢笔市场很热闹，Sheaffer、Waterman、Wahl-Eversharp 都在改外形、改上墨、改笔尖。Parker 51 的聪明处在于，它没有只改某个零件。暗尖、流线笔身、Lucite 材料、配套墨水和新的供墨思路被放在同一支笔里。

暗尖是这支笔的核心。传统钢笔把笔尖摊在外面，笔尖好看，也容易干。51 把笔尖缩进前端，只露出触纸的部分，墨水通道被包起来。这个设计带来的好处很直观：拔帽就写的概率更高，长时间停笔后的不耐烦少一些。为了适应这个结构，51 的笔尖也变窄，手感更硬，线条不靠弹性取悦人。它写起来像一个安静的机械零件，稳定、克制，几乎不要求使用者配合。

Lucite 笔身也让 51 和早一点的硬橡胶、赛璐珞钢笔拉开距离。它摸起来没有金属的冷感，也少了旧赛璐珞那种花纹戏剧性。Parker 当年在广告里强调耐用、现代和速度，这些词落到 51 上并不空。流线笔帽、箭形笔夹、光滑笔身，放在一起像一件战后工业产品。它没有让钢笔显得更古典，反而把钢笔往打字机、飞机、办公桌那套现代想象里推了一步。

上墨系统是另一个分水岭。早期 Vacumatic 版本有更强的机械感，也更像收藏者想象中的老派 Parker。后来 Aerometric 版本简化了维护，那个 Pli-Glass 吸墨管到今天仍被很多修笔人称赞。想日用，Aerometric 更容易让人放心；想玩结构和年代味，Vacumatic 更有意思。这两个版本不该混着买。看笔身铭文、笔帽、尾端和内部结构，比只看卖家标题靠谱。

把 Parker 51 放回同代市场，它和 Sheaffer Snorkel 走的是两条路。Snorkel 让上墨动作变成一次精密表演，吸墨管伸出来，笔尖可以不碰墨水。Parker 51 没有这种戏剧感。它的目标更朴素：少漏、少干、少解释。Eversharp Skyline 的外形很漂亮，流线笔帽很有时代感，但内部仍接近传统钢笔。51 的现代感藏在你看不到的地方。

这也是它到今天还被反复使用的原因。很多老笔适合收藏，真正带出门会犹豫：怕漏墨，怕笔囊老化，怕一不小心把脆弱材料摔出裂。状态好的 51 没那么娇气。它当然是老笔，也需要正常维护，但它的使用门槛比许多同年代钢笔低。你可以把它当成一支历史物件，也可以把它灌上墨，放进笔袋里继续写。

Parker 51 也改变了人们看钢笔的角度。早一点的钢笔常把大笔尖、花纹笔杆和上墨机构当作卖点，51 把这些表演收起来，留下一个干净的外形。它看起来接近一支高级铅笔，笔帽一拔就能进入书写。这种处理对今天的读者很重要，因为它解释了 51 为什么没有明显的古董气。它靠怀旧赢得好感的成分很少，更大的吸引力来自那些被提前处理掉的麻烦：干尖、漏墨、复杂上墨、外形过时。

The Pen Addict 的日用视角也能解释它的现代吸引力。真正拿 51 写一页纸，你最先感到的是动作少。笔帽好开，握位清楚，暗尖不容易让手指沾到墨。它没有现在大金尖那种视觉刺激，也少了软尖的线条变化，可这种平实恰好让人放松。它适合在办公桌上写清单、批注、会议记录，也适合拿来理解 20 世纪中期美国钢笔为什么会把可靠性看得这么重。

版本差异会把 51 的性格拉开。Vacumatic 透明纹理和机械结构更有收藏趣味，维修时也更考验经验；Aerometric 更接近日用思路，吸墨管和金属护套让内部看起来像一个小型部件。英国、美国、加拿大等产地，笔帽材质和笔夹细节也会改变价格。新手若只想写字，不必急着追稀有版本。先找一支结构健康、笔尖顺、笔帽合得稳的 51，比追求某个广告名词更实际。

日常使用时，Parker 51 不太像一支会让人惊呼的笔。它不炫耀大金尖，也不靠柔软弹性讨好手指。它的好处要写一阵才出来：握位不累，出水均匀，笔帽插拔快，外形放在今天也不显旧。很多老笔需要一点脾气和耐心，51 少一些。它像一件已经调好的工具，拿起来就进入工作状态。

买 Parker 51 要冷静。先分清 Vacumatic 和 Aerometric，再看产地、笔帽材质、笔夹、笔身刻字和笔尖状态。裂纹、收缩、笔帽松动、供墨器堵塞都会影响使用。价格太低的 51 往往需要维修预算，外观很新的也未必写得好。它的价值不只在“经典”两个字里。真正值得买的，是那种几十年后还能让你忘记笔本身的 51。`,
  },
  {
    slug: "凌美-lamy-lamy-2000",
    title: "LAMY 2000：灰黑色工具笔为什么会留下来",
    summary: "LAMY 2000 从 1966 年延续至今，靠 Makrolon 笔身、半包 14K 金尖和活塞上墨形成了很少过时的工具感。",
    sourceIds: [
      "source-rfp-lamy-2000-official",
      "source-rfp-lamy-design",
      "source-rfp-gentleman-lamy-2000",
    ],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 10,
      authenticity: 9,
      concision: 9,
      notes: "文章用使用入口和结构解释推进，避免把 LAMY 2000 写成抽象设计宣言。",
    },
    body: `LAMY 2000 的外形很容易被误读。它看起来太安静了，灰黑色笔身， brushed stainless steel 笔帽，笔尖只露出一点。放在一排钢笔里，它不像礼品，也不像收藏柜里的主角。可它从 1966 年一直卖到现在，靠的正是这种不抢戏的性格。

LAMY 官网把 LAMY 2000 放在品牌设计史里讲，设计师 Gerd A. Müller 的名字也总会跟它一起出现。那段背景很重要，但最好不要把它讲成“包豪斯神话”。真正落到手里，LAMY 2000 的设计感来自几个具体决定：玻璃纤维增强 Makrolon 笔身，活塞上墨，半包 14K 金尖，笔帽和笔身之间几乎没有多余装饰。你看不到传统钢笔那种大笔尖，也看不到炫目的纹路。它把所有装饰欲望都压低了。

这种克制会让 LAMY 2000 显得比实际年代更年轻。1960 年代的许多产品看回去都有明确时代印记，2000 却很难被一眼放进某一年。它没有夸张的金属件，也没有后来设计笔常见的锋利线条。圆润、哑光、灰黑色，这些选择让它像办公桌上的一件常用品。它看上去并不便宜，只是没有把贵写在外面。

Makrolon 是这支笔的触感来源。它不像金属笔那样冷，也不像光面树脂那样滑。磨砂表面会随使用留下细微痕迹，新的时候有一点生，写久了会变得更顺。LAMY 2000 的握位没有明显台阶，笔身从中段自然收向笔尖。这个形状对很多人很舒服，也会让另一部分人烦躁，因为半包尖旁边有两个小小的笔帽卡点，握得低的人会碰到。

半包金尖决定了它的书写性格。LAMY 2000 不是一支靠弹性表达情绪的笔，笔尖被前端包住，视觉上也不鼓励你盯着尖看。它的重点是稳定和速度。很多使用者喜欢它，是因为它能长时间写字，不会让人总想着“我正在用一支贵钢笔”。这句话听起来朴素，却很接近 LAMY 2000 的核心。它把高级感做成了一种日常感。

和 Pilot Custom 823、Pelikan M800 这类活塞或大容量笔相比，LAMY 2000 的存在感更低。823 让你看到墨水，M800 让你看到条纹和大金尖，LAMY 2000 让这些东西退到后面。它也不像 Montblanc 149 那样有强烈的社交符号。你把它拿到会议室里，懂笔的人会看一眼；不懂的人只会把它当成一支灰黑色钢笔。

这个低存在感也会影响购买判断。想要一支拿出来就有仪式感的笔，LAMY 2000 可能太安静。想要一支每天写几页、不必担心配色和装饰的人，LAMY 2000 会变得顺手。活塞储墨量够用，笔身轻，笔帽插拔快，磨砂表面也不太怕指纹。它像一件长期工具，优点在重复使用里慢慢出现。

把它放在 LAMY 自己的产品线里看，2000 和 Safari 也很不同。Safari 把握位、颜色、笔夹都做得外放，适合入门，也适合让人一眼记住。2000 则把这些信号压低，连笔尖都藏起来。它更像给已经习惯钢笔的人准备的工具：不用解释怎样握，不用用颜色提醒自己这是一支设计笔，只需要拿起来写。这个差别也说明 LAMY 的设计并不只有一种面貌。

LAMY 2000 的活塞结构让它比普通墨囊笔更像主力笔。一次上墨可以支撑较长书写，笔身没有透明示范的热闹，墨量只能靠经验判断。这个小缺点反而符合它的气质：它不把内部展示给你看，只要求你按固定节奏使用。喜欢每天换墨、喜欢看墨水晃动的人，会更适合 Pilot Custom 823 或示范款钢笔。喜欢一瓶黑墨或蓝黑墨长期写的人，2000 的节奏会舒服很多。

评价 LAMY 2000 时还要小心“设计经典”这几个字。经典容易让人以为它没有缺点。实际使用里，半包尖的甜区、笔帽卡点、EF 粗细浮动、活塞清洗成本都会影响体验。它也不适合所有中文书写：写得很小、习惯转笔、喜欢极细硬尖的人，可能会觉得它不够听话。可一旦握姿和尖号合适，它的优势很稳定。它不会每天给你新鲜感，却能把书写这件事降到很低的摩擦。

它还有一个很现实的优点：外观不挑环境。黑色 Makrolon 和不锈钢笔帽放在办公室、书房、咖啡店都自然，搭配什么笔袋也不会突兀。很多高价钢笔会让人担心刮花、磕碰和社交目光，LAMY 2000 的磨砂表面削弱了这种心理负担。它看上去像工具，价格却已经进入认真购买的区间，这种反差正是它长期有讨论度的原因。

这支笔也有门槛。半包尖的甜区会让某些人不适应，尤其是习惯旋转笔杆写字的人。笔尖粗细也要谨慎选，LAMY 2000 的 EF 在不同批次和调校下不总是想象中的“极细”。活塞上墨带来不错的储墨量，清洗却比普通上墨器麻烦一点。它适合长期用一种墨水的人，不适合每天换颜色玩。

买 LAMY 2000 时，先问握位和笔尖角度。最好试写。试不到，就选保守尖号，收到后检查笔帽卡点、活塞顺滑度和出水。它没有太多花哨故事，优势也不需要夸大。LAMY 2000 最迷人的地方，是你用了一年后可能想不起来它有什么惊喜，却一直没把它从桌面上拿走。`,
  },
  {
    slug: "百乐-pilot-custom-823",
    title: "Pilot Custom 823：一支为长写准备的透明大水箱",
    summary: "Pilot Custom 823 的吸引力来自真空上墨、透明笔身和 14K 金尖组合，它更像一支可靠的长写工具。",
    sourceIds: [
      "source-rfp-pilot-custom-823-official",
      "source-rfp-goulet-custom-823",
    ],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "减少日用旗舰一类口号，改成真空上墨和长写场景解释。",
    },
    body: `Custom 823 最容易让人记住的是那一管墨水。透明或半透明笔身里，墨水跟着笔杆晃动，写到哪里、还剩多少，一眼就知道。很多钢笔把上墨系统藏起来，823 刚好相反。它让你看见储墨量，也让你知道这支笔为什么适合长写。

Pilot 官方资料把 Custom 823 放在 Custom 系列里，真空上墨和 14K 金尖是它的主要身份。它没有复杂装饰，常见颜色也克制，琥珀、烟灰、透明都服务于同一个目的：让墨水成为视觉的一部分。拿它和普通墨囊/上墨器钢笔比，差别不在“高级”两个字，而在使用节奏。823 吸满一次，可以写很久。写长笔记、日记、会议记录时，这种省心很直接。

Custom 这个名字在 Pilot 产品线里跨度很大。Custom 74 更轻便，Custom 743 接近 823 的大金尖但用上墨器，Custom 845 又把漆面和更高端材料带进来。823 站在中间：它有大笔尖，有大容量，也有透明笔身带来的实用感。它没有 845 的工艺展示，也没有 74 的轻松价格。它像一支把书写放在前面的旗舰。

真空上墨的动作有仪式感。拉开尾杆，把笔尖伸进墨水瓶，推下去，负压会把墨水吸进笔身。第一次用会觉得它像小型机械。这个系统也有一个使用习惯：长时间书写前，尾钮通常要旋开一点，让墨水顺利进入前端供墨。忘了这一步，写到一半可能会变干。很多新手第一次遇到这个情况，以为笔有问题，其实只是没有让储墨仓和前端连通。

Custom 823 的 14K 金尖很大，视觉上比很多日系金尖更有存在感。Pilot 的调校通常偏顺滑，出水稳定，适合写中文也适合连续英文笔记。它不靠强弹性取悦人，线条变化有限，优点在可预期。你知道它下一笔会怎么出水，这种稳定感在长写里比短暂惊艳更有用。

和 Platinum #3776 Century 比，823 的反馈更少，储墨量更大，维护也麻烦一些。和 Sailor Pro Gear 比，它少了那种铅笔感，换来更顺的纸面移动。和 LAMY 2000 比，它更愿意让你看见结构，也更像一支为墨水爱好者准备的透明工具。三者都可以日用，823 的优势集中在“写很久”这件事上。

还有一个容易被忽略的细节：真空上墨让 823 更适合固定搭配墨水。你会更愿意给它选一瓶稳定、颜色耐看、清洗不折磨人的墨。亮片墨、强染色墨、容易结垢的墨水都要谨慎。823 不是不能玩墨水，它只是会把换墨的成本放大。喜欢频繁试色的人，可能会发现普通上墨器钢笔反而更自由。

Custom 823 的笔身透明，也让它比许多黑色金尖更容易和墨水建立关系。琥珀色笔身配茶色、蓝黑、暗绿，烟灰色笔身配冷色系，透明版本则把墨水颜色直接摆出来。这个视觉乐趣不是多余装饰。它会影响你愿不愿意长期使用一瓶墨，也会让剩余墨量成为书写节奏的一部分。写到半管以下时，笔身里的墨水晃动很明显，长写的人会自然留意下一次上墨。

823 的另一面是体积。它比 Custom 74 更稳，也比很多入门日系钢笔更有重量。握位不算奇怪，笔身也没有夸张台阶，但它并不是随便塞进口袋的小笔。长时间写字时，尾钮是否旋开、笔帽是否插在尾端、纸张是否吃墨，都会改变体验。多数人会把它当成桌面主力，而不是随身备用。这样用，823 的优点最容易出来：坐下、打开、连续写，途中很少被墨水打断。

如果第一次买高价日系金尖，823 很容易被推荐到面前。这个推荐有道理，也需要边界。它适合愿意理解真空结构的人，适合有固定书写场景的人，适合想从普通上墨器钢笔往上走的人。若只是偶尔签名，或者喜欢每周换不同墨水，823 的大容量反倒会显得笨重。它是一支很强的长写工具，不是一支替所有人回答问题的钢笔。

读 823 的资料时，最该抓住的词其实是“连续”。连续写，连续出水，连续看到墨量。它把很多钢笔爱好者喜欢的东西放在一起，却没有把外观做得夸张。透明笔身让它有玩家气，黑色笔尖区和金色饰件又让它保持传统。它不像展示款那样只给人看内部，也不像全黑商务笔那样把结构藏起来。这个平衡让 823 很容易成为一支长期留在桌上的笔。

它也适合作为“少而精”的选择。与其买几支上墨量普通、性格相近的金尖，823 更像一支能承担多数长写任务的工具。这个思路并不浪漫，却很实用。你会更关心它是否每天稳定、是否好清洁、是否适合常用纸张，而不是每次打开笔盒都寻找新鲜感。

这支笔也不是无脑推荐。清洗真空上墨比清洗上墨器费事，换墨频繁的人会累。透明笔身会让墨迹、水汽、细小沉积变得更显眼。大容量意味着你一旦灌了不喜欢的墨，就要和它相处更久。823 适合相对固定的墨水、较长的书写时间和愿意接受维护成本的用户。

购买时先确认版本、颜色、尖号和渠道。二手笔要看活塞杆动作、密封圈状态、笔尖是否被打磨过，透明笔身还要看裂纹。Custom 823 的口碑很高，但它的好不在传说里。它真正解决的问题很具体：给一支顺滑可靠的日系金尖，配上足够大的墨水空间，让你写到忘记加墨这件事。`,
  },
  {
    slug: "白金-platinum-3776-century",
    title: "Platinum 3776 Century：一支不怕放干的日系金尖",
    summary: "Platinum #3776 Century 以富士山高度命名，14K 金尖和 Slip & Seal 笔帽让它成为日系金尖里很容易长期使用的一支。",
    sourceIds: [
      "source-rfp-platinum-3776-official",
      "source-rfp-goulet-3776",
    ],
    humanizer: {
      directness: 10,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把命名、密封和笔尖反馈分开写，避免空泛称赞。",
    },
    body: `Platinum #3776 Century 的名字先把你带到富士山。3776 是富士山的高度，听起来有点用力，笔本身却没那么夸张。它常见的树脂笔身、14K 金尖、墨囊/上墨器结构都很传统。真正让它在日用里留下位置的，是一件小事：放几天再打开，它通常还能写。

Platinum Pen USA 的 #3776 Collection 页面把 Slip & Seal 笔帽机制放在重要位置。这个机制不是为了制造谈资。钢笔最烦人的瞬间之一，是你拿起它准备写字，第一笔却干在纸上。Slip & Seal 想解决的正是这个问题。笔帽内部的密封结构让笔尖区域更稳定，减少停用后的干尖。对于一支会被放在桌上、包里、抽屉里的日用金尖，这比许多装饰更实用。

这个机制也改变了 #3776 的使用场景。它适合那种不是每天写很多、但需要随时拿起来能用的人。比如办公桌上放一支红墨批注，或者手账里隔几天写一段。普通钢笔在这种场景里容易让人失去耐心，#3776 的笔帽让它更像一支可靠的备用金尖。它没有大容量的炫技，却解决了一个经常发生的小麻烦。

富士山命名给 #3776 一个清楚的记忆点，但这支笔并不靠故事撑起来。它的结构很朴素：树脂笔身、可换墨囊或上墨器、螺纹笔帽、14K 金尖。也正因为朴素，Slip & Seal 的价值才更突出。你不需要为了密封机制改变使用习惯，照常盖上笔帽就行。对普通读者来说，这比参数表里的许多数字更容易感知。

它在桌面上的角色也很特别。Custom 823 更像主力长写笔，Sailor Pro Gear 更像有强烈笔尖性格的选择，#3776 Century 则介于两者之间。它不追求最大储墨量，也不把笔尖反馈做得过分锋利。很多时候，它更像一支“随时能开始”的日用金尖：今天写两行，明天放着，过几天再打开，最好别让你重新洗笔、蘸水、哄它出墨。

#3776 Century 的笔尖也有自己的性格。它不是那种滑到没有存在感的日系笔。Platinum 的 14K 金尖常给人较清楚的纸面反馈，写中文时这种反馈会让笔画更有边界。喜欢玻璃感顺滑的人可能觉得它有阻尼；喜欢控制感的人会觉得它好用。这个分歧不需要调和，试写比看评论更重要。

尖号会直接决定这支笔的用途。UEF 和 EF 适合很小的字，也会更挑纸和手法；F、M 更接近日常主力；B、C 这类宽尖能把墨水颜色铺开，中文小字就要谨慎。部分渠道还会见到软细一类选择，写感和普通硬尖又不同。买 #3776 最怕只看颜色或价格，忽略尖号。它的笔尖选择足够细，选错以后，同一支笔会变成完全不同的工具。

和 Pilot Custom 823 比，#3776 Century 储墨量小，清洗简单，防干更强。和 Sailor Pro Gear 比，它的反馈没有 Sailor 那么“铅笔”，价格和版本选择也经常更容易进入。它像一支很会守本分的金尖笔。没有大容量真空上墨，也没有复杂材料故事，优点集中在笔帽、笔尖和可维护性。

材质和外观也不能只当装饰看。透明杆能看到上墨器和墨色，普通不透明树脂更低调，限定配色会让价格波动很大。#3776 的基础结构没有因为颜色改变太多，所以日用购买可以把颜色放在尖号之后。收藏或送礼另说，特殊版本的吸引力很大，但初次理解 #3776，普通树脂版已经足够说明它的本事。

这支笔还有一种容易被忽略的稳定感。螺纹笔帽让你每次盖上都比较确定，墨囊/上墨器让维护简单，14K 金尖又给它足够的书写身份。它不像活塞笔那样需要考虑内部清洗，也不像老笔那样需要担心年代件。对于第一次认真买日系金尖的人，#3776 的学习成本不高。你可以从它开始理解笔尖反馈、尖号差异和密封结构，再决定自己要不要往更大、更贵或更有个性的方向走。

放在中文书写里，#3776 的优势会更清楚。很多中文笔画短，转折多，过分顺滑的笔会让字形变散。Platinum 的反馈能给手一点阻力，让横竖撇捺更容易停住。这个特点不一定讨好所有人，却很适合写小字、批注和手账。若搭配太粗的尖号和太湿的墨水，它又会变成另一种性格，所以纸、墨、尖号最好一起考虑。

这支笔也适合拿来理解“日系三金”的差异。Pilot 往往被说成顺，Sailor 更有沙沙反馈，Platinum 夹在中间又有自己的硬朗感。这样的概括很粗，但能帮助第一次比较的人找到方向。真正落到购买，还是要看尖号。Platinum 的 UEF、EF、F、M、B、C 等选择会让同一支 #3776 完全变成不同工具。

版本方面，普通树脂、透明示范、富士旬景、莳绘或特殊材料会拉开价格。普通版适合日用，特殊版更多带收藏和审美属性。二手购买要检查笔帽密封、笔尖是否歪斜、握位是否有裂纹，上墨器是否匹配。#3776 Century 的价值不在“所有人都喜欢”，而在它把一个常见痛点解决得很认真。对于经常隔几天才拿起钢笔的人，这点足够重要。`,
  },
  {
    slug: "sailor-pro-gear",
    title: "Sailor Pro Gear：平顶外形里的写乐笔尖脾气",
    summary: "Sailor Pro Gear 把写乐金尖反馈和平顶外形放在一起，和雪茄形 1911 形成了清楚的性格差别。",
    sourceIds: [
      "source-rfp-sailor-progear-official",
      "source-rfp-sailor-1911-official",
    ],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "用 1911 对照解释 Pro Gear，避免堆砌尺寸和尖号。",
    },
    body: `Sailor Pro Gear 的第一眼差别在笔帽和尾端。它是平顶，不是 1911 那种雪茄形。这个差别看似只关外观，放到手里会改变整支笔的气质。1911 更像传统礼服，Pro Gear 更像把写乐金尖放进了一个短一点、利落一点的壳里。

Sailor 官方把 Professional Gear 和 1911 分成两条清楚的系列。两者都能见到写乐的金尖体系，尺寸也有 Slim、标准、King of Pen 等变化。Pro Gear 的平顶让它看起来更现代，笔帽端和尾端的装饰环也更容易成为配色的一部分。写乐这些年大量特别色、限定色、地区色，Pro Gear 是主要载体之一。对玩家来说，它常常先以颜色吸引人，最后留住人的还是笔尖。

Pro Gear 的好处在于它把“写乐感”做得更容易入口。1911 的雪茄形很传统，适合喜欢经典比例的人；Pro Gear 少一点礼服感，多一点文具感。平顶也让它更适合玩颜色。很多品牌做彩色树脂会显得轻浮，Sailor 往往靠笔尖把这件事压住。你可以因为一支限定色买它，最后仍会回到纸面反馈上。

写乐笔尖的反馈很难只用“顺”来讲。它在纸上有细小阻尼，像铅笔划过纸面。这个比喻被用得很多，因为确实接近。喜欢的人会觉得它有控制感，写小字时笔画不飘；不喜欢的人会觉得它不够滑，甚至有点吵。21K 和 14K 的差异、尖号、尺寸、调校都会改变这种感觉。Pro Gear 的魅力就在这里：同一个外形家族，能装下很多细微脾气。

和 Pilot Custom 823 比，Pro Gear 不靠大容量取胜。和 Platinum #3776 Century 比，它的反馈更有辨识度，防干机制没有 Platinum 那么突出。和 1911 比，Pro Gear 的笔身更短、更方，视觉上少一点传统感。选择 Pro Gear 时，其实是在选择“我想要写乐笔尖，但不想要雪茄形”。

尺寸要认真看。Slim 对手小的人友好，也更轻；标准款更均衡；King of Pen 是另一种东西，尺寸、价格和笔尖存在感都明显上去。很多人第一次买 Pro Gear 会被颜色带走，真正影响长期使用的却是尺寸和尖号。日常中文小字可以从 MF、F 看起，想要更明显墨迹再往 M 或 B 走。盲买粗尖要谨慎，写乐的反馈和出水不一定符合每个人对“金尖”的想象。

Pro Gear 也不是一支适合所有场景的笔。墨囊/上墨器结构清洗方便，储墨量普通。写短笔记、批注、手账很舒服，连续写几十页时，尺寸和重量就要重新评估。喜欢很滑、很湿、大容量的人，Pilot Custom 823 会更直接。喜欢防干和硬朗控制的人，Platinum #3776 Century 也许更稳。Pro Gear 的位置更窄一点，却也更鲜明。

这支笔在近年的可见度，很大一部分来自配色。Sailor 很擅长把树脂颜色、金属件和笔尖颜色搭在一起，季节色、店铺限定、地区限定会不断出现。对新读者来说，这很容易让 Pro Gear 看起来像“颜色玩具”。真正写过以后会发现，颜色只是入口，笔尖才是留下来的理由。它的反馈会提醒你正在写字，纸张粗细、墨水润滑度、下笔角度都会被放大一点。

Pro Gear 和 1911 的选择，也可以从使用场景想。1911 的雪茄形更传统，放在正式场合很稳；Pro Gear 的平顶更像现代文具，配色空间也更大。Slim 适合手小和短写，标准款更适合多数成人，King of Pen 已经进入大笔和收藏的范围。只看照片很难判断比例，尤其是 Pro Gear Slim，漂亮但不一定适合所有手型。

墨囊/上墨器结构让 Pro Gear 的维护很轻松。换墨、清洗、旅行携带都比活塞大容量钢笔省事。代价是储墨量普通，写长文时会更频繁地补墨。这个结构和它的性格其实很合：它适合拿来写一段有手感的文字，而不是一口气抄完整本笔记。手账、明信片、批注、短日记，都能让它的笔尖反馈变成优势。

Pro Gear 也很适合解释为什么同一品牌会保留两种经典外形。1911 用雪茄形延续传统钢笔的稳重，Pro Gear 用平顶把同一套笔尖语言放进更短、更方的身体里。这个差别在照片上不大，在手里会变明显。平顶让尾端更干脆，插帽后的长度和重心也和 1911 不同。买之前若能试握两者，比读十段评论都更有效。

它还有一个很适合中文读者的地方：MF 这类中细尖能在细字和墨色之间取得相对舒服的平衡。太细会放大纸面反馈，太粗又容易让中文笔画挤在一起。Pro Gear 的笔尖选择让人有空间慢慢找自己的线宽，也让同一支系列能服务完全不同的字迹。

购买时还要看版本。普通款、限量款、地区限定、联名色会让价格差别很大，但书写核心未必成比例变化。收藏可以追颜色，日用先看尺寸、笔尖和售后。Pro Gear 最有意思的地方，是它没有把写乐变得温顺。它让笔尖保留一点脾气，然后用平顶外形和丰富配色把这点脾气包装得更容易入口。`,
  },
  {
    slug: "万宝龙-montblanc-大班149-meisterst-ck",
    title: "Montblanc 149：一支很难只按书写评价的钢笔",
    summary: "Montblanc Meisterstück 149 有大尺寸金尖、活塞上墨和强烈品牌符号，购买前要把书写、身份感和版本差异分开看。",
    sourceIds: [
      "source-rfp-montblanc-149-official",
      "source-rfp-gentleman-montblanc-149",
    ],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 10,
      authenticity: 9,
      concision: 8,
      notes: "承认品牌符号的存在，但没有把它写成广告。",
    },
    body: `Montblanc 149 很难只当成一支钢笔看。你把它拿出来，白色雪峰、粗大的雪茄形笔身、大尺寸金尖已经先说话了。它写得好不好当然重要，可 149 的问题从来不只在纸面上。它同时是一支书写工具、一个品牌符号，也是一类被反复讨论的收藏对象。

Montblanc 官方把 149 放在 Meisterstück 体系里。Meisterstück 这个名字从 1920 年代就进入品牌叙事，149 则是其中最有代表性的大尺寸活塞钢笔之一。它的造型很稳定：黑色树脂笔身，金属饰环，活塞上墨，大金尖。你可以说这些元素传统，甚至保守。可它们组合在一起，识别度极高。很多人不认识 Pelikan M800，也不认识 Pilot 823，但会认得 Montblanc。

这种识别度会带来负担。149 太容易被当成身份符号，书写本身反而被挤到后面。可如果把品牌光环先放一边，它仍然是一支结构完整的大型活塞金尖笔。活塞储墨量充足，笔身粗，笔尖视觉上非常开阔。它的确有工具属性，只是这个工具从一开始就很难保持低调。

149 的尺寸是第一道门槛。它不是一支轻巧签字笔。笔身粗，笔尖大，握在手里有明显存在感。喜欢大笔的人会觉得它从容，手掌有空间，笔尖在纸上也显得稳。不喜欢大笔的人会觉得它笨，长写容易累。The Gentleman Stationer 这类长期评测会反复提到这一点：149 的评价离不开手型和使用场景。

大金尖是它最有吸引力的部分。149 的笔尖视觉张力强，出水和触纸感也会随年代、尖号和调校变化。现代 149 和老 149 不能简单混在一起说。老笔有不同笔尖样式、供墨状态和维修历史，现代笔有更稳定的售后和更高价格。想买来日用，现代渠道省心；想玩年代和笔尖差异，就要准备学习成本。

拿 149 和 Pilot Custom 823 比，会发现它们解决的是不同需求。823 更像长写工具，透明笔身和真空上墨把实用性摆在前面。149 的储墨量也不小，但它从外观到品牌都更有仪式感。和 Pelikan M800 比，149 更粗、更像商务符号；M800 的活塞结构、可旋出笔尖和条纹笔身则更偏传统玩家路线。

Meisterstück 这个名字也会影响读者判断。它会让人预设“这应该是最好的钢笔”，随后把价格、品牌、书写感混在一起。更稳妥的看法，是把 149 拆成几件事：一支大尺寸活塞笔，一枚大金尖，一个强识别度品牌，一套长期维护和二手市场体系。拆开以后，很多争论会变得清楚。你可以承认它有品牌溢价，也可以承认它的结构和书写基础确实扎实。

149 的历史也让版本判断变得复杂。不同年代的笔尖、笔舌、活塞机构、笔身细节会影响收藏价格和书写体验。老 149 可能有更有趣的笔尖，也可能带来更麻烦的维修。现代 149 更容易通过官方渠道购买和保养，价格却让人更在意每一处小瑕疵。第一次接触 149，不建议只凭“老款更好”或“新款最稳”下结论。看状态，比看年代口号更重要。

日用中的 149 很吃场合。它适合坐下来写信、签文件、写较大的字，也适合在桌上作为主力笔使用。它不适合随手塞进裤袋，也不适合手小、写字极细、偏爱轻笔的人。插帽后重心会明显改变，许多人更愿意不插帽写。这个选择没有高下，只说明 149 需要你用自己的手来判断，而不是用品牌名替你判断。

如果把它放进现代购买清单，149 的竞争对手并不少。Pelikan M1000 更强调大笔尖和活塞玩家属性，Pilot Custom 823 更强调长写和透明储墨，Sailor King of Pen 更强调笔尖反馈和日本金尖性格。149 的独特处在于，它把这些书写问题和品牌识别绑在一起。喜欢这种组合，它很难替代；只想要一支好写的大笔，选择会宽很多。

149 也会逼读者面对一个现实：钢笔从来不只是参数。它的笔尖、活塞和尺寸当然能被评测，白色雪峰带来的心理感受却同样真实。有人会享受这种仪式感，有人会觉得它干扰书写判断。成熟的购买方式需要先承认品牌确实在价格里占了位置，再问自己是否愿意为这部分付钱。这样看 149，会比简单说“值得”或“不值”更诚实。

如果把 149 当作礼物，它的逻辑又会变化。收礼者未必懂活塞和笔尖年代，却很容易读懂 Montblanc 这个符号。若买来自己写，书写舒适度必须排在前面；若买来送人，品牌识别和售后便利也会进入判断。很多关于 149 的争论，正是因为这两种场景被混在一起。把使用和赠礼分开，149 的优缺点会清楚很多。

购买 149 最怕只听一句“标杆”。它确实是标杆，但标杆不等于适合每个人。先确认自己能不能接受尺寸，再看尖号、年代、渠道和维修状态。二手 149 要检查活塞顺滑度、笔尖铱粒、笔帽裂纹、笔身刻字和是否有打磨痕迹。新笔则要试写，尤其是出水和笔尖角度。149 的价格里有书写，也有品牌。把这两件事分开想，反而更容易判断它值不值。`,
  },
  {
    slug: "百利金-pelikan-m800",
    title: "Pelikan M800：德系活塞笔的分量感",
    summary: "Pelikan M800 是 Souverän 系列里很有代表性的大尺寸活塞钢笔，条纹笔身、18K 金尖和可拆笔尖组件构成了它的玩家属性。",
    sourceIds: [
      "source-rfp-pelikan-m800-official",
      "source-rfp-pelikan-collectibles-m800",
    ],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "以尺寸和活塞结构为主线，没有写成高端德系空话。",
    },
    body: `Pelikan M800 的第一印象通常来自两件事：条纹笔身和分量。绿条纹最经典，光线穿过半透明的醋酸纤维时，能隐约看到里面的墨水。拿起来以后，笔身比 M400、M600 更有存在感。它不是大到夸张的笔，却足够让人知道自己拿着一支高阶活塞钢笔。

Pelikan 官方把 M800 放在 Souverän 系列里。这个系列的识别度很稳定：鸟嘴形笔夹、条纹笔身、活塞上墨、金属装饰环。M800 是其中很关键的尺寸。它比 M600 更厚实，笔尖也更大；又没有 M1000 那么软和夸张。对很多人来说，M800 是 Pelikan 日用和收藏之间的平衡点。

M800 还有一种很老派的优点：你能看懂它。条纹笔身让墨量隐约可见，活塞旋钮告诉你怎么上墨，笔尖组件可以旋出，品牌标识也很清楚。它不像某些现代设计笔那样需要解释自己的姿态。它就是一支传统活塞钢笔，把尺寸、材料和结构都做得比较满。

活塞是 Pelikan 的核心体验。旋开尾端，墨水被吸进笔身，储墨量比普通上墨器更让人放心。M800 的活塞动作通常顺滑，维护也有玩家友好的一面：笔尖组件可以旋出，清洗和更换比许多一体结构容易。这个设计让 M800 很适合长期使用，也让它天然进入玩家讨论。你可以换尖，可以维护，可以把它当成一件会陪你很多年的工具。

M800 的 18K 金尖给它带来柔中带稳的性格。它不像 Sailor 那样强调纸面反馈，也不像 LAMY 2000 那样低调到几乎消失。Pelikan 的金尖常被期待有更湿润的出水和更明显的笔尖存在感。实际手感要看年份和单支状态，现代尖、老尖、EF 到 B 的差别不小。盲买时，宁可多看书写样张，也别只看尖号字母。

和 Montblanc 149 比，M800 更像玩家笔。149 的品牌符号很强，M800 的讨论更多落在活塞、条纹、笔尖和版本上。和 Pilot Custom 823 比，M800 没有透明大水箱那种直观容量感，却有更传统的德系结构和更方便的笔尖维护。和 M1000 比，M800 更容易日用，尺寸和笔尖都收得住。

Pelikan-Collectibles 这类资料会把 M800 的版本差异拆得很细，颜色、年代、笔尖刻印、笔帽顶标、活塞细节都能成为识别点。普通读者不必一开始就进入收藏目录，但知道这些差异有用。M800 的二手价格很容易被“老尖”“特别版”“绝版色”影响，日用购买和收藏购买应分开判断。只想写字，状态健康比版本稀有更重要。

M800 也能帮助人理解 Pelikan 为什么有一批稳定玩家。它的笔尖组件可以旋出，意味着清洗、换尖、维修都更直观。你可以给同一支笔换不同尖号，也可以把一枚喜欢的笔尖留在熟悉的笔身上。现代许多钢笔把结构封得很紧，M800 保留了某种可维护的传统。这不是华丽卖点，却会在长期使用中变得实际。

书写上，M800 的“湿润”需要和纸张一起看。好的纸能让墨色铺开，线条显得饱满；普通复印纸可能会洇、透、干得慢。EF 和 F 在德系语境里也未必像日系那样细。写中文小字的人要谨慎，喜欢大字、签名或英文长写的人更容易享受它的出水。M800 不是靠极细控制取胜，它更像一支让墨水流动起来的笔。

M800 的外观也有一种很耐看的秩序。鸟嘴笔夹、条纹笔杆、金色饰环都很传统，组合起来却不显得沉闷。绿条纹最有 Pelikan 味道，蓝条纹更清爽，黑色更正式，特别版会把这套结构换上不同颜色。无论哪一种，M800 都不太像潮流产品。它更像一个长期存在的标准尺寸，让人围绕它讨论“我需要更小的 M600，还是更大的 M1000”。

对于第一次买 Pelikan 的人，M800 可能不是最轻松的入口。M200、M400 更便宜也更轻，M600 尺寸更温和。M800 的价格、重量和笔尖尺寸都要求你已经知道自己喜欢什么。它适合把钢笔当作长期书写工具的人，也适合愿意研究版本和笔尖的人。若只是想试试活塞钢笔，先从更小尺寸开始也很合理。

真正适合 M800 的人，通常已经对纸张和墨水有一点偏好。你知道自己能接受湿润出水，知道常用纸能不能扛住更饱满的线条，也知道大笔握在手里会不会累。M800 会把这些偏好放大，所以它不像一支盲买友好的笔。选对了，它很稳；选错了，它的高级感也救不了手上的不适。

这支笔也很吃握笔习惯。M800 的重量和尺寸会让小手用户犹豫，插帽书写更要小心重心。喜欢轻笔的人可能会觉得它厚重；习惯大笔的人会觉得它稳。Pelikan 的出水通常偏充足，搭配纸张和墨水时要留意洇墨。它适合写信、笔记、签字和慢一点的长文。它不适合塞进口袋，也不适合把每一种新墨水都试一遍。

买 M800 要看版本。绿条、蓝条、红条、黑色、特别版都会影响价格。二手笔要检查活塞是否顺滑、笔尖组件是否正常、笔帽环和笔身有没有裂纹，透明条纹里是否有难清的墨迹。M800 的魅力不在“贵”，而在它把传统活塞钢笔的几个关键乐趣做得很完整。它有重量，有储墨量，有可维护的结构，也有足够强的外观记忆点。`,
  },
  {
    slug: "kaweco-sport",
    title: "Kaweco Sport：小到能放进口袋的钢笔",
    summary: "Kaweco Sport 的重点是短笔身、八角笔帽和便携比例，合盖很短，插帽后才变成一支正常可写的笔。",
    sourceIds: [
      "source-rfp-kaweco-sport-official",
      "source-rfp-kaweco-history",
    ],
    humanizer: {
      directness: 10,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 10,
      notes: "文章用便携体验展开，句式较短，符合轻量型号的内容节奏。",
    },
    body: `Kaweco Sport 的乐趣从尺寸开始。合上笔帽时，它短得不像一支正经钢笔，放进口袋、零钱包或小本夹层都不费劲。把笔帽插到尾端，它又变成接近正常长度的书写工具。这个动作很简单，却解释了 Sport 为什么能活这么久。

Kaweco 官方把 Classic Sport 放在 Sport 家族里，八角笔帽、短笔身和墨囊结构是它最容易辨认的特征。Sport 这个名字可以追到更早的 Kaweco 历史，现代 Classic Sport 则把这种便携比例做成了很稳定的产品。它不像 LAMY 2000 那样讨论工业设计，也不像 Montblanc 149 那样带着社交符号。Sport 更像一支随手塞进包里的小工具。

Sport 的设计有一种很现实的聪明。很多钢笔一旦变短，握持就会牺牲很多；Sport 靠长笔帽解决这个问题。合盖时短，写字时把笔帽插到尾端，长度就回来了。八角笔帽还有一个小好处：放在桌上不容易滚走。对于一支经常被带出门的小笔，这个细节比很多装饰更有用。

短笔身带来的好处很直接。你不用给它准备专门的笔盒，也不怕它在口袋里太长。八角笔帽能防滚，外观也比普通圆杆更有记忆点。缺点同样明显：不插帽时太短，大手用户很难舒服书写；插帽后重心会往后走一点。Classic Sport 的塑料版本很轻，长写不累，但质感也朴素。AL Sport、Brass Sport、Steel Sport 这些金属版本会把手感彻底改掉，尤其是黄铜，重量几乎让它变成另一支笔。

Sport 的笔尖通常是钢尖，EF、F、M、B、BB 等规格给了它足够的日用选择。它不是靠笔尖惊艳取胜。真正的卖点是“我愿意带它出门”。墨囊结构简单，短上墨器兼容性要看版本和配件，储墨量也别期待太多。它适合短笔记、手账、签字、外出备用。长篇书写当然可以，但那不是它最舒服的场景。

Kaweco Sport 的入门价值也在这里。它让很多人第一次意识到钢笔可以不必端着。它可以被塞进牛仔裤口袋，可以和钥匙、卡包放在一起，也可以丢进手账封套。塑料版刮花了不会太心疼，金属版磨损后反而有使用痕迹。对一支便携笔来说，这种“不太金贵”的气质很重要。你会愿意把它带出去，它才有机会真正写字。

材质版本会把同一个 Sport 拆成几种性格。Classic Sport 轻，便宜，颜色多；Skyline Sport 通过银色金属件改变视觉；AL Sport 更结实，也更有工具感；Brass Sport 会随着使用氧化变暗，重量明显增加；Steel Sport 更冷、更沉。照片里它们很像，手里差别很大。第一次买，塑料或铝版更容易判断自己是否喜欢这个比例。

它的短处也要说清楚。Sport 的墨囊容量有限，短上墨器往往不如标准上墨器好用，钢尖品控偶尔需要调整。笔帽螺纹让它放在包里更安心，频繁签字时也会比插拔帽慢一点。若你每天要写很多页，Sport 不是最省力的选择。若你只是想随身带一支真正能用的钢笔，它的缺点就容易接受。

和 Pilot Custom 823 这种大容量钢笔比，Sport 几乎站在另一端。823 适合坐下来写很久，Sport 适合被临时拿出来。和 LAMY Safari 比，Sport 更短、更成人化，也更不占包。和 Kaweco Liliput 比，Sport 没那么极端，八角笔帽和较粗笔身让它更容易握住。

和许多复古复刻不同，Sport 的复古感不会挡住日用。它的八角笔帽有老品牌味道，塑料和彩色版本又足够轻松。你可以把它当成便宜入门，也可以把黄铜或钢版本当成随身小物。它没有必要被神化成收藏传奇。Sport 的生命力来自一个很小的答案：当你出门只想带一支短笔，它刚好合适。

它也很适合作为“第二支钢笔”。第一支钢笔常常要负责证明钢笔好写，第二支则可以负责某个具体场景。Sport 的场景很清楚：包里备用，外出写几句，旅行时不占空间。它不抢主力笔的位置，也不需要你为它准备复杂维护。正因如此，很多人即使后来买了更贵的笔，仍会留一支 Sport 在包里。

从品牌历史看，Kaweco 的吸引力也不全在单支笔。它把 Sport 做成了一个很容易扩展的家族：塑料、铝、黄铜、钢、不同颜色、不同夹子、不同包装。玩家可以慢慢换材质，普通用户也能用很低门槛进入。这个家族化策略让 Sport 既像入门笔，也像一件可反复购买的小工具。

若页面读者只想知道该不该买，答案可以很直接：想要口袋笔，Sport 值得看；想要长时间主力书写，先看别的。它的定位越明确，越不容易让人失望。

买 Sport 时，先决定材质，再决定尖号。塑料版便宜轻松，适合试水；AL Sport 更结实，质感也更像日常 EDC；黄铜和钢版有重量，喜欢的人很喜欢，不适应的人会觉得累。检查笔帽松紧、笔尖是否刮纸、上墨器是否能装进去。Kaweco Sport 不需要被写成传奇。它最好的地方就是简单：小，能带，写得出字，而且愿意跟着你出门。`,
  },
  {
    slug: "白金-platinum-出云-izumo",
    title: "Platinum Izumo：把漆面和金尖做得安静一点",
    summary: "Platinum Izumo 属于白金的高端工艺线，18K 金尖、生漆或木材版本和偏大的笔身让它更适合慢一点的书写。",
    sourceIds: [
      "source-rfp-platinum-izumo-official",
      "source-rfp-endlesspens-izumo",
    ],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "保留材料和使用判断，删掉“和风气质”一类空泛词。",
    },
    body: `Platinum Izumo 不像 #3776 Century 那样容易解释。#3776 可以从防干、14K 金尖和价格讲起，逻辑很清楚。Izumo 要慢一点。它的吸引力在笔身材料、漆面、尺寸和 18K 金尖之间，第一眼未必抓人，用久了才知道它想表达什么。

Platinum Pen USA 的 Izumo Collection 页面列出 PIZ-55000、PIZ-100000 等版本，常见信息包括 18 kt 金尖和 F、M、B 尖号。零售资料会进一步写到硬橡胶、木材、生漆处理和墨囊/上墨器结构。也就是说，Izumo 的重点不在复杂上墨，也不在透明结构。它把传统材料和现代金尖放在一起，做成一支偏大的、握在手里有温度的钢笔。

出云这个名字也会影响你看它的方式。它听起来有地域和工艺的气息，容易让人期待某种“日本感”。真正有价值的部分不在这个词本身，而在版本细节。不同漆面、木材、莳绘或硬橡胶底材，都会改变价格和触感。买 Izumo 时，只看“18K 金尖”远远不够，材料名和工艺说明要一起看。

生漆或木材笔身会改变使用感。金属笔的重量来得很直接，树脂笔的轻巧也很直接。Izumo 这类工艺线更细腻，表面触感、温度变化、长期使用留下的光泽，都会参与体验。它不适合只看参数买。两支同样写着 Izumo 的笔，材料和版本不同，拿在手里可能差很多。

18K 金尖给 Izumo 带来高端定位，但不要把它想成柔软夸张的笔。Platinum 的金尖通常有一定控制感，Izumo 的大型笔身也会让书写节奏变慢一点。它适合签字、日记、慢写和喜欢材料感的人。若你想要大容量，Pilot Custom 823 更直接；若你想要同品牌里更轻便、更便宜的日用金尖，#3776 Century 更清楚。

Izumo 也适合和 Pilot Custom 845 放在一起想。两者都牵涉日本工艺材料和高端金尖，但品牌调性不同。Pilot 更容易被理解成“顺滑可靠的高级日用”，Platinum Izumo 则多了一点克制和材料触感。喜欢透明示范、彩色树脂或强烈配色的人，可能会觉得 Izumo 太安静。喜欢安静的人，恰好会被这点留住。

Izumo 的阅读方式也和普通商品页不同。看普通钢笔，读者常先看笔尖、上墨方式、价格。看 Izumo，还要把漆面名称、底材、纹理和工艺说明放进判断。官方和零售页面给出的 PIZ 型号并非装饰编号，它们对应不同材质和等级。若只把所有 Izumo 都当成“白金 18K 大笔”，就会漏掉它真正拉开差距的地方。

这类笔的使用体验有一部分来自时间。漆面和木材不会像透明树脂那样直接展示结构，却会在握持、反光和触感里慢慢显出来。刚拿到时，你可能只觉得它大、安静、价格高；写过一阵，手指对表面的温度和摩擦会更敏感。它不急着给人惊喜，也不适合用几分钟试写就完全下判断。Izumo 更像一支要在固定桌面上慢慢熟悉的笔。

和 Nakaya 这类更强手工定制感的品牌相比，Izumo 仍然保留 Platinum 的工业稳定性。它用的是相对清楚的产品线、常规金尖和墨囊/上墨器结构，维护难度比许多复杂工艺笔低。这个位置很有意思：它有工艺感，却没有把自己完全推向陈列柜。愿意日用的人可以用，愿意收藏材料和版本的人也有线索可追。

Izumo 的笔尖选择看起来没有 #3776 那么夸张，实际购买仍要谨慎。F、M、B 已经会带来明显差异。F 更适合中文日常和手账，M 更容易展示墨水和漆面笔身的从容，B 则更偏签名和大字。Platinum 的控制感会保留下来，所以不要只凭“18K”想象它一定柔软。高端金尖并不等于放任手指，它仍然有品牌自己的书写秩序。

照顾 Izumo 也要比普通树脂笔更细。漆面怕硬物刮擦，也怕被随手丢进装满钥匙的包里。木材和漆的版本需要你接受自然材料的细微差异，不要把它当成无痕工业塑料。喜欢粗放通勤的人会觉得麻烦，喜欢把笔当作长期物件的人会觉得这些注意事项很正常。它的价格里有书写，也有材料和表面处理，使用方式最好跟着调整。

购买前还要分清自己想要的是 Platinum 的书写，还是 Izumo 的材料。若只是喜欢 Platinum 笔尖，#3776 Century 已经能给出很清楚的答案；若在意漆面、木材、尺寸和安静的高级感，Izumo 才有意义。这个判断能省掉很多冲动消费。高端系列最怕只看品牌和价格，真正长期留下来的，往往是手感和审美都对得上的那一支。

它的尺寸也要留意。Izumo 往往比普通 #3776 更有存在感，放在手里不算小。长时间写字时，握位、重心和笔身表面的摩擦感都会变得明显。生漆表面漂亮，也需要更小心地对待磕碰和硬物摩擦。它适合固定在书桌、笔盒或通勤包里的安稳位置，不太适合粗放使用。

购买 Izumo 要看版本名和材料。生漆、木材、莳绘或其他工艺版本不能混着比价格。还要看笔尖刻字、包装、上墨器、漆面是否有磕碰和修补痕迹。它不是适合所有人的高端笔。它适合那种愿意把钢笔当作手中物件慢慢使用的人，写字之外，还在意触感和时间留下的变化。`,
  },
  {
    slug: "sheaffer-s-snorkel",
    title: "Sheaffer Snorkel：把吸墨动作做成一场小机械表演",
    summary: "Sheaffer Snorkel 的代表性来自伸缩吸墨管，笔尖可以不直接浸入墨水，结构精巧，也带来更高维护门槛。",
    sourceIds: [
      "source-rfp-richardspens-snorkel",
      "source-rfp-penhero-snorkel",
    ],
    humanizer: {
      directness: 9,
      rhythm: 10,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "以吸墨动作开头，技术解释具体，没有把 Snorkel 神化。",
    },
    body: `Sheaffer Snorkel 最好玩的地方，是吸墨时那根细管。旋开尾端，细管从笔尖下方伸出来，像潜望镜一样探出去。你只需要把管子伸进墨水瓶，笔尖本身不用沾进墨水。吸完墨，管子收回去，笔尖还算干净。这个动作第一次看会觉得过分复杂，也确实有点迷人。

Richard Binder 和 PenHero 都把 Snorkel 放在 Sheaffer 1950 年代的重要产品里讲。它接在 Touchdown 系统之后，把气压上墨和伸缩吸墨管结合起来。那是美国钢笔公司还愿意为上墨动作投入大量机械想象力的年代。Parker 51 把体验做得简洁，Sheaffer Snorkel 则把问题拆到机械层面：怎样让用户吸墨时少弄脏笔尖。

这个设计放在今天看，甚至有点奢侈。现代钢笔很少为了吸墨这一步做这么复杂的结构，墨囊和上墨器已经足够方便。Snorkel 迷人的地方就在这里：它把一个小痛点放大成工程问题，再用一套零件认真回答。你可以觉得它多此一举，也可以被它的认真打动。两种反应都很正常。

Snorkel 的结构很聪明，也很麻烦。里面有密封件、弹簧、管子和气压系统，任何一个老化都会影响吸墨。保养好的 Snorkel 用起来非常优雅，保养差的 Snorkel 只会让人怀疑人生。买老笔时，卖家说“能写”不够，必须确认 Snorkel 管能正常伸缩，吸墨是否有效，密封是否更新过，笔尖和供墨是否通畅。

它的笔尖选择也丰富。Sheaffer 在那个年代有不同等级和款式，Triumph 锥形笔尖、开放式笔尖、不同型号名都会影响收藏和书写。Snorkel 不是单一一支笔，更像一套产品家族。Admiral、Statesman、Valiant、Crest 等名字会让新手头大，但这些差别关系到笔尖材质、笔帽装饰和价格。

和 Parker 51 比，Snorkel 更像机械爱好者的笔。51 的好处是安静和省心，Snorkel 的好处是动作和巧思。和现代真空上墨比，Snorkel 的储墨量未必有优势，维护难度却高不少。它不适合只想买一支省事老笔的人。它适合愿意理解结构、接受维修、享受老式机械动作的人。

写起来的 Snorkel 也不能只按上墨系统判断。Sheaffer 的笔尖有自己的历史，Triumph 锥形笔尖、开放式笔尖和不同等级配置会给出不同手感。很多 Snorkel 年代已经很久，笔尖状态、供墨清洁度、维修质量都会改变体验。一支修好的 Snorkel 可以很顺，一支没修好的 Snorkel 只会让人记住它的麻烦。

Snorkel 的型号名也值得慢慢看。Admiral、Saratoga、Statesman、Valiant、Crest 这些名字不只是营销，它们往往对应不同笔帽、笔尖和装饰等级。PenHero 的图片资料能帮助新手把外观和名称对上。第一次买不必追求最稀有的款式，先找一支维修记录清楚、吸墨动作完整、笔尖适合自己字迹的 Snorkel，更容易感受到这个系统的乐趣。

它和 Sheaffer 自家的 Touchdown 也有关系。Touchdown 已经把上墨动作做成气压系统，Snorkel 再往前走一步，把吸墨管伸出去。这个改动看起来小，内部却多出一串维护点。正因为这样，Snorkel 很能代表那个年代的美国钢笔工程心态：用户手上只多一个旋钮动作，笔里面却藏着一套复杂回答。今天的上墨器简单可靠，Snorkel 则把便利做成了机械表演。

日用 Snorkel 要接受老笔现实。它可以写得很好，也可能因为一个密封件老化就无法吸墨。它可以让吸墨过程很干净，也会在维修不当时让人抓狂。买家最好把“能出水”和“系统健康”分开看。前者只说明笔尖有墨，后者才说明它作为 Snorkel 正常工作。这个差别决定了你买到的是一支会写字的老 Sheaffer，还是一支真正保留 Snorkel 乐趣的老笔。

Snorkel 也能提醒今天的读者，钢笔历史里有一段很爱解决“小问题”的时期。吸墨时弄脏笔尖算不上大麻烦，可 Sheaffer 愿意为它设计伸缩管、密封和气压动作。这个答案比问题本身还复杂。正因如此，Snorkel 不适合只按效率评价。它的效率未必比现代上墨器高，乐趣却来自那套认真过头的机械逻辑。

如果你已经有 Parker 51，再看 Snorkel 会很有意思。51 把多数动作藏起来，让使用者少想一点；Snorkel 把动作做得更精密，让使用者忍不住多看一眼。两支笔都在追求便利，性格却相差很远。这种差别比单纯比较价格更能说明 1950 年代钢笔设计的丰富程度。

如果你想买 Snorkel，先把预算分成两部分：买笔的钱和维修的钱。已经专业修复的笔通常更贵，但省很多麻烦。未修复的便宜笔看起来诱人，真正能稳定使用还要换密封、清理管路、检查笔尖。Snorkel 的魅力就在这里。它把一件简单的事做得很复杂，却复杂得有理由。你看着那根细管伸出来，会明白 1950 年代的钢笔公司曾经多么认真地琢磨“怎样吸一管墨”。`,
  },
  {
    slug: "写乐-sailor-1911-profit系列",
    title: "Sailor 1911 / Profit：雪茄形外壳里的写乐笔尖",
    summary: "Sailor 1911 / Profit 系列把写乐的 14K、21K 金尖放进传统雪茄形笔身，和 Pro Gear 的平顶路线形成了清楚分工。",
    sourceIds: [
      "source-rfp-sailor-1911-official",
      "source-rfp-sailor-1911s-14k",
      "source-rfp-sailor-1911s-21k",
    ],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把 1911/Profit 放回写乐产品线解释，避开空泛的日系三金套话。",
    },
    body: `Sailor 1911 / Profit 最容易被 Pro Gear 抢走注意力。Pro Gear 有平顶，有大量特别色，照片里更像近年的文具潮流。1911 / Profit 安静得多，雪茄形笔帽和尾端让它看起来像一支传统钢笔。可真正落到纸上，两者共享的是写乐最重要的东西：那套带着细小阻尼的金尖语言。

Sailor 官方把 1911 系列单独列出，和 Professional Gear 分开讲。这个区分很有用。1911 的重点在经典外形，Pro Gear 的重点在平顶和更现代的视觉比例。Profit 是日本市场里常见的命名，1911 是海外读者更熟悉的叫法。中文页面把 1911、Profit、鱼雷、大鱼雷、标准鱼雷混在一起时，读者最该先确认尺寸、笔尖材质和具体 SKU，颜色要放在这些信息之后。

1911 的雪茄形有一种低调的好处。笔身线条从中段向两端收，握在手里很自然，也不太挑场合。它没有 Pro Gear 那种利落的平顶，也没有 Montblanc 149 的强社交符号。它更像把写乐笔尖装进一个保守、稳定、容易接受的外壳。喜欢传统钢笔比例的人，往往会比喜欢特别色的人更快理解 1911。

写乐官方产品页能看到 14K 和 21K 的不同口径。初次购买时，不要简单把 21K 看成“更高级所以一定更适合”。14K 通常更紧实，价格也更容易进入；21K 会给人更高端的预期，但具体软硬、出水和反馈仍由尖号、尺寸和单支调校共同决定。写乐的魅力并不在夸张弹性，而在触纸时那种细密的控制感。

这种反馈对中文书写很有价值。写中文小字时，过分顺滑的笔容易让笔画漂，写乐的轻微阻尼会帮手指停住。F、MF、M 这些尖号差别很大，MF 往往是很多人进入写乐的安全选择：线条不至于太细，墨色也能出来一点。若你喜欢玻璃一样滑的纸面感，Pilot Custom 系列会更直接；若你喜欢防干和硬朗控制，Platinum #3776 会更稳。1911 的位置更偏向“有反馈，但仍能长期写”。

和 Pro Gear 比，1911 的审美更成熟，也更少被配色牵着走。Pro Gear 很适合玩限定色，1911 更适合选择一支黑杆、酒红、透明或稳重色，长期放在桌上。这个差别会影响购买后的满意度。若你买钢笔主要是为了收集颜色，Pro Gear 更容易给你新鲜感；若你希望外形不过时，1911 / Profit 反而更省心。

尺寸也要认真看。1911 S、1911 Large、King of Pen 不是同一支笔的简单放大。小号更轻、更适合短写和手小用户；Large 更接近成人主力笔；King of Pen 已经进入大尺寸和高价区间，笔尖存在感完全不同。中文语境里的“鱼雷”也容易混用，买之前最好对照官方型号和笔尖刻字，不要只看卖家标题。

上墨方式同样会影响使用。常规 1911 / Profit 多见墨囊/上墨器结构，清洗方便，换墨轻松，储墨量普通。1911 Realo 则把活塞系统带进这个外形里，使用节奏又不同。若你每天写很多页，普通上墨器会更频繁补墨；若你经常换颜色，它又比活塞更轻松。选择时先想自己的真实书写量，比追一个更响亮的型号名有用。

1911 / Profit 的日用气质也比 Pro Gear 更稳。黑色、酒红、透明这些常见外观不会过分抢眼，放在办公桌上比许多限定色更耐看。它适合那种想长期使用写乐笔尖，却不想让钢笔外观太跳的人。写会议记录、批注、读书笔记、手账都可以，只要尖号选对，它不会强迫你用某种特殊方式书写。

这支笔的弱点也清楚。墨囊/上墨器储墨量普通，连续长写时不如 Pilot Custom 823 省心。写乐反馈对纸张和墨水比较敏感，纸太粗会放大阻尼，墨水太干会让笔尖显得更紧。若你平常用廉价复印纸写很小的字，F 或 MF 更稳；若你用好纸写英文或大字，M、B 才更容易表现墨色。买之前最好带自己的纸试写。

1911 / Profit 还容易被“日系三金”这个标签盖过去。标签有帮助，但也会偷懒。真正判断时，要看它在 Sailor 自己产品线中的位置：它比 Pro Gear 更传统，比 King of Pen 更克制，比入门钢尖更能体现写乐金尖的触感。理解了这个位置，再去看价格和版本，就不容易被各种限定色或二手描述带偏。

如果页面读者只想快速判断，1911 / Profit 适合喜欢传统外形和清晰反馈的人。它不负责惊艳第一眼，负责在每天反复书写时保持稳定的写乐味道。

买 1911 / Profit 时，先定尺寸，再定尖号，最后再看颜色和限定属性。二手笔要看笔尖是否被打磨、笔帽螺纹是否顺、笔身是否有裂纹。新笔最好试写，尤其是写乐反馈是否合口味。1911 / Profit 的好处不在惊喜，而在它把写乐笔尖放进一个最传统、最稳的身体里。你若喜欢这套触纸感，它会比许多更花哨的钢笔更耐用。`,
  },
  {
    slug: "凌美-lamy-logo",
    title: "LAMY Logo：一支被低估的金属日用笔",
    summary: "LAMY Logo 是凌美产品线里更细、更克制的金属日用钢笔，重点在圆柱笔身、钢尖体系和低存在感的办公属性。",
    sourceIds: [
      "source-rfp-lamy-logo-official-family",
      "source-rfp-goulet-lamy-logo",
      "source-rfp-wellappointed-lamy-logo",
    ],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "把官方系列文案和评测边界分开，避免把 Logo 写成 Safari 或 2000 的附属品。",
    },
    body: `LAMY Logo 常被夹在 Safari 和 LAMY 2000 中间。Safari 有鲜明的三角握位和彩色塑料外壳，LAMY 2000 有 Makrolon、活塞和设计经典的光环。Logo 安静得多，一根细长的金属圆柱，笔夹简单，握位也不夸张。它没有强烈表情，这正是它容易被忽略的原因。

LAMY 官方现在更容易看到 Logo 家族的其他书写工具页面，钢笔规格需要结合 Goulet 和 The Well-Appointed Desk 这类评测来读。这个来源边界要讲清楚：官方页面能说明 Logo 系列的简洁取向，具体到钢笔手感、握位和笔尖，长期评测更有帮助。把这两类资料合在一起，Logo 的位置会清楚很多。它是一支偏办公、偏低调、偏细杆的日用钢笔。

Logo 的外形几乎没有装饰。金属笔身拉得很直，视觉上比 Safari 成年，也比 Studio 更瘦。它不靠大笔尖、透明储墨或复杂材料吸引人。你把它放进会议本、电脑包或笔筒里，它不会像一支收藏笔那样提醒周围的人注意。这个低存在感对某些读者很有价值：想用钢笔，但不想让钢笔成为桌面主角。

它和 Safari 的差别，先从握位开始。Safari 的三角握位会主动纠正手指位置，喜欢的人觉得省心，不喜欢的人会觉得被限制。Logo 的握位更传统，也更窄，手指自由度高一些。The Well-Appointed Desk 的评测会提到金属表面和握持感，这一点对中文读者尤其重要。若你握笔低、手容易出汗，细金属握位可能会滑；若你喜欢轻薄直杆，Logo 会很顺手。

LAMY 的钢尖体系让 Logo 很容易维护。它通常使用 LAMY 常见的可换钢尖，EF、F、M 等尖号能覆盖日常书写。这个系统没有金尖的仪式感，却很实用：笔尖便宜，替换方便，出问题时不用把整支笔送修。对一支日用金属笔来说，这比高调配置更符合它的性格。

Logo 的上墨也很普通，墨囊或上墨器就能解决。它不像 LAMY 2000 那样有活塞储墨量，也不像 TWSBI 那样把墨水展示出来。普通结构带来普通好处：清洗简单，换墨方便，旅行时可以带墨囊。若你希望一支钢笔每天写很多页，它的储墨量不会特别突出；若你只是会议记录、批注、手账和短文，它足够安静。

和 LAMY Studio 比，Logo 更轻、更细，也更少“设计物件”的姿态。Studio 的笔夹和圆润金属笔身更有存在感，Logo 则像一支严肃一点的办公笔。和 Safari 比，它少了学生感，也少了颜色带来的活力。和 LAMY 2000 比，它的书写和材料层级都低很多，却没有 2000 的甜区门槛和活塞维护成本。这个位置不耀眼，实际很清楚。

Logo 的一个好处，是它不会把 LAMY 的入门体系割裂开。若你已经有 Safari、Al-Star 或 Vista，Logo 的笔尖体验不会完全陌生。你可以把熟悉的 LAMY 钢尖带到一个更细、更金属、更办公的身体里。这个连续性对普通用户很实用：换笔不等于重新适应所有东西。你只需要判断细杆和金属握位是否适合自己。

它的外观也适合不想显得“玩笔”的人。很多钢笔一拿出来就带着爱好者气息，Logo 更像一支认真一点的日常书写工具。它可以放进公司会议室、客户签字场景，也可以在家里写清单。别人未必会注意它，使用者自己却能感到它比普通中性笔更有重量和触感。对某些场景，这种分寸比炫耀更好。

当然，Logo 也不是所有人的答案。细杆会让手大的人觉得支撑不够，金属表面在潮湿手指下可能变滑。它的笔帽和笔夹也应实物检查，旧笔尤其要看卡合是否松。若你追求宽大的握持、饱满墨迹和强烈设计感，Studio、2000 或其他品牌会更合适。Logo 最适合的，是喜欢低调金属直杆，又希望维护成本保持在 LAMY 入门体系内的人。

Logo 还有一个适合网页读者的判断方法：把它想成 LAMY 钢尖体系里的“办公金属杆”。如果这个定位正好击中你的使用场景，它会显得很聪明；如果你期待它拥有 LAMY 2000 的材料故事或 Safari 的鲜明个性，它就会显得太淡。淡不是问题，买错期待才是问题。

买 Logo 要先确认自己是否喜欢细杆。很多钢笔爱好者习惯较粗笔身，拿到 Logo 会觉得太瘦；习惯圆珠笔或中性笔的人，反而更容易过渡。再看握位材质、笔帽松紧、笔夹弹性和笔尖顺滑度。二手或旧库存还要确认上墨器是否匹配。Logo 的价值不在“经典型号”这个标签里，它更像一支把钢笔使用门槛降到办公日常里的工具。

若你已经有 Safari，Logo 不一定是升级，更像换一种气质。Safari 适合轻松、彩色、明确握姿；Logo 适合低调、金属、直杆。若你已经有 LAMY 2000，Logo 也不会替代它。它适合放在包里承担不太隆重的任务。正因为它不隆重，才可能成为一支真正经常被拿起来的笔。`,
  },
  {
    slug: "noodler鲶鱼-简易钢笔",
    title: "Noodler’s 简易钢笔：便宜、可调，也需要耐心",
    summary: "Noodler’s 简易钢笔更接近 Nib Creaper / Standard Flex 这类入门可调钢笔，重点在活塞上墨、钢弹性尖和可折腾的供墨结构。",
    sourceIds: [
      "source-rfp-noodlers-standard-flex-official",
      "source-rfp-goulet-noodlers-nib-creaper",
      "source-rfp-wonderpens-noodlers-nib-creaper",
    ],
    humanizer: {
      directness: 9,
      rhythm: 9,
      trust: 9,
      authenticity: 9,
      concision: 9,
      notes: "明确说明中文条目指向 Nib Creaper/Standard Flex 这一路线，不把低价弹性尖写成复古软尖。",
    },
    body: `Noodler’s 的钢笔最容易让新手困惑。中文里一句“鲶鱼简易钢笔”，可能指 Charlie，也可能指 Nib Creaper、Ahab、Konrad 这类便宜、可拆、可折腾的笔。现有来源更接近 Nib Creaper / Standard Flex 这一路线：小号钢弹性尖、活塞上墨、树脂笔身，价格不高，玩法却不少。读这个页面时，先把“简易”理解成入门可调，而不是省心无脑。

Noodler’s 本来更以墨水出名，钢笔则带着很强的实验气质。官方 Standard Flex 页面把 Standard Creaper、ebonite feed、piston fill 和 bottled ink 放在一起，这几个词足够说明它的方向。它不是一支追求精致外观的笔，也不是一支开盒就保证完美顺滑的笔。它更像给愿意动手的人准备的低价平台：你可以试弹性尖，可以调供墨，也可以理解墨水和笔舌怎样互相影响。

Nib Creaper 的尺寸偏小，笔身也不厚。和 Ahab、Konrad 这些更大的 Noodler’s 笔相比，它更轻、更细，也更像一支真正的入门笔。Goulet 这类零售页面会把它列为 slender piston-filling resin fountain pen，并强调较小的 flexible steel nib。这个描述很朴素，却能帮读者判断预期：它不是大型签字笔，也不是豪华材料笔。它的重点在结构和价格。

“flex” 是最需要降温的词。Noodler’s 的钢弹性尖能压出线条变化，但它不等于老式湿面条软尖。要出变化，需要压力、角度、速度和合适墨水配合。压得太狠，笔尖会刮纸、断墨，甚至损伤笔尖。Wonder Pens 这类评测能给出更接近日用的提醒：它有趣，也需要调整；它能玩线宽，却不是给完全不想折腾的人准备的。

这类笔的 ebonite feed 也是双刃剑。供墨可以调，清洗和拆装也更开放，问题是新手更容易把笔弄乱。出水太小，你会想把笔舌往前调；出水太大，墨水又可能糊成一片。某些墨水太干会让 flex 体验变差，太湿又会让纸张承受不住。买 Noodler’s 简易钢笔，最好同时准备一点学习耐心。它的便宜并不意味着它会自动省心。

和 Pilot Kakuno、LAMY Safari 这类入门钢笔比，Noodler’s 的路线完全不同。Kakuno 和 Safari 追求稳定、可预期、少维护；Noodler’s 让你看到钢笔内部怎样工作。它适合想理解笔尖、笔舌、墨水和压力关系的人。若你只是需要一支每天写作业或会议记录的笔，Kakuno、Safari、Preppy 会更轻松。若你想用低成本摸一摸 flex 的边界，Noodler’s 才有意义。

它也适合拿来解释“便宜笔为什么还会有玩家”。有些便宜笔只是便宜，写坏了就丢；Noodler’s 的便宜带着可调整空间。你可以拆洗，可以试墨，可以观察活塞上墨，也可以学习什么叫供墨跟不上。这个过程不一定优雅，却很有教育意义。很多高价钢笔把这些细节藏起来，Noodler’s 则把它们摊到你手里。

购买时要先确认具体型号。若页面或卖家只写“简易钢笔”，一定要看照片、长度、上墨结构和笔尖刻字，分清 Charlie、Nib Creaper、Ahab、Konrad。再看是否全新、是否已经被前任调过、笔尖和笔舌是否对齐、活塞是否顺。若你怕异味、怕塑料感、怕调尖，提前避开会更好。若你愿意把它当作一支能学习、能试错的工具，它会比价格看上去更有内容。

还有一个现实问题：Noodler’s 的体验很依赖使用者处理小问题的能力。出水忽大忽小、笔尖刮纸、笔舌位置不对、墨水搭配不合适，都可能出现在同一支笔上。喜欢稳定的人会觉得烦，喜欢调校的人会觉得这正是乐趣。买它之前，最好把期待放在“学习和实验”，不要放在“便宜买到高级软尖”。

它也不适合被当成唯一入门笔推荐给所有人。第一次买钢笔的人若只是想顺利写字，Preppy、Kakuno、Safari 这类更稳。Noodler’s 更适合第二阶段：你已经知道钢笔基本怎么用，开始好奇笔尖为什么会开叉、供墨为什么会断、墨水为什么会影响线条。到了这个阶段，它的粗糙感反而有价值，因为每个问题都能让你学到一点结构。

所以，这支笔的购买理由不该是“便宜”。便宜只是门票，真正的理由是你愿意把它当作练习台。愿意动手，它会很好玩；只想省心，它会显得脾气太多。最好同时准备一瓶稳定墨水和一张不太洇的纸，先把变量减少。

Noodler’s 简易钢笔最适合的读者，是已经接受钢笔可能需要一点维护的人。它不会给你 Montblanc 的精致，也不会给你 Pilot 的稳定调校。它给的是便宜、开放和一点不安分。把这点想清楚，评价会公平很多：它不是完美入门笔，却是一支很适合理解“钢笔为什么能被调整”的入门笔。`,
  },
];

function aliasArticle(sourceSlug: string, slug: string, title: string, summary: string): SampleArticle {
  const source = ARTICLES.find((article) => article.slug === sourceSlug);
  if (!source) throw new Error(`Missing source article for alias: ${sourceSlug}`);
  return { ...source, slug, title, summary };
}

const ALL_ARTICLES: SampleArticle[] = [
  ...ARTICLES,
  aliasArticle(
    "派克-parker-51-经典-vintage",
    "the-parker-51",
    "Parker 51：把钢笔变成随手可用的工具",
    "Parker 51 的重点在暗尖、Lucite 笔身和 Vacumatic/Aerometric 上墨，它把老式钢笔从需要照看的物件推向了更省心的日用工具。",
  ),
  aliasArticle(
    "百乐-pilot-custom-823",
    "pilot-custom-823",
    "Pilot Custom 823：一支为长写准备的透明大水箱",
    "Pilot Custom 823 的吸引力来自真空上墨、透明笔身和 14K 金尖组合，它更像一支可靠的长写工具。",
  ),
  aliasArticle(
    "百利金-pelikan-m800",
    "pelikan-souveran-m800",
    "Pelikan Souverän M800：德系活塞笔的分量感",
    "Pelikan Souverän M800 是 Souverän 系列里很有代表性的大尺寸活塞钢笔，条纹笔身、18K 金尖和可拆笔尖组件构成了它的玩家属性。",
  ),
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
  return db.execute({ sql, args: args as InArgs });
}

function humanizerTotal(article: SampleArticle) {
  const score = article.humanizer;
  return score.directness + score.rhythm + score.trust + score.authenticity + score.concision;
}

function validateArticle(article: SampleArticle) {
  const failures: string[] = [];
  for (const [pattern, label] of BANNED_PATTERNS) {
    if (pattern.test(article.body) || pattern.test(article.title) || pattern.test(article.summary)) {
      failures.push(label);
    }
  }
  const total = humanizerTotal(article);
  if (total < 45) failures.push(`humanizer score ${total}/50`);
  if (article.body.length < SAMPLE_MIN_CHARS) {
    failures.push(`too short ${article.body.length}; expected at least ${SAMPLE_MIN_CHARS}`);
  }
  return failures;
}

async function upsertSource(db: Client, source: SourceDef) {
  await execute(
    db,
    `INSERT INTO source_registry
     (id, name, source_type, allowed_use, reliability, attribution, homepage_url, fetch_method, notes, last_checked_at, created_at, updated_at)
     VALUES (?, ?, ?, 'summary_only', ?, ?, ?, 'manual', ?, date('now'), datetime('now'), datetime('now'))
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
      source.sourceId,
      source.sourceName,
      source.sourceType,
      source.reliability,
      source.sourceName,
      source.homepageUrl,
      "Source registered for reader-first sample articles; summarize only.",
    ],
  );

  await execute(
    db,
    `INSERT INTO source_items
     (id, source_id, title, url, item_type, summary, allowed_use, review_status, retrieved_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'summary_only', 'approved', date('now'), datetime('now'), datetime('now'))
     ON CONFLICT(source_id, url) DO UPDATE SET
       title = excluded.title,
       item_type = excluded.item_type,
       summary = excluded.summary,
       allowed_use = excluded.allowed_use,
       review_status = excluded.review_status,
       retrieved_at = excluded.retrieved_at,
       updated_at = datetime('now')`,
    [source.id, source.sourceId, source.title, source.url, source.itemType, source.summary],
  );
}

async function findEntity(db: Client, slug: string) {
  const result = await execute(
    db,
    "SELECT id, name FROM entities WHERE slug = ? AND type = 'pen' LIMIT 1",
    [slug],
  );
  const row = result.rows[0];
  if (!row) return null;
  return { id: String(row.id), name: String(row.name) };
}

async function upsertStory(db: Client, entityId: string, article: SampleArticle) {
  const existing = await execute(
    db,
    "SELECT id FROM stories WHERE entity_id = ? AND story_type = 'model_story' LIMIT 1",
    [entityId],
  );
  const storyId = existing.rows[0]?.id ? String(existing.rows[0].id) : randomUUID();
  const sourceNotes = `Reader-first sample article. Humanizer-zh self-review: ${humanizerTotal(article)}/50. ${article.humanizer.notes}`;

  if (existing.rows[0]?.id) {
    await execute(
      db,
      `UPDATE stories
       SET title = ?, summary = ?, body_md = ?, status = 'reviewed', source_notes = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [article.title, article.summary, article.body, sourceNotes, storyId],
    );
  } else {
    await execute(
      db,
      `INSERT INTO stories
       (id, entity_id, title, story_type, summary, body_md, status, source_notes, created_at, updated_at)
       VALUES (?, ?, ?, 'model_story', ?, ?, 'reviewed', ?, datetime('now'), datetime('now'))`,
      [storyId, entityId, article.title, article.summary, article.body, sourceNotes],
    );
  }

  return storyId;
}

async function linkSource(db: Client, entityId: string, storyId: string, source: SourceDef) {
  const sourceItem = await execute(
    db,
    "SELECT id FROM source_items WHERE source_id = ? AND url = ? LIMIT 1",
    [source.sourceId, source.url],
  );
  const sourceItemId = sourceItem.rows[0]?.id
    ? String(sourceItem.rows[0].id)
    : source.id;

  await execute(
    db,
    `INSERT OR IGNORE INTO entity_references
     (id, entity_id, source_item_id, relation_type, note, review_status, created_at)
     VALUES (?, ?, ?, ?, 'Reader-first sample source pack', 'approved', datetime('now'))`,
    [randomUUID(), entityId, sourceItemId, source.relationType || "reference"],
  );
  await execute(
    db,
    `INSERT INTO citations
     (id, target_type, target_id, source_item_id, note, created_at)
     SELECT ?, 'story', ?, ?, 'Reader-first sample source', datetime('now')
     WHERE NOT EXISTS (
       SELECT 1 FROM citations
       WHERE target_type = 'story' AND target_id = ? AND source_item_id = ?
     )`,
    [randomUUID(), storyId, sourceItemId, storyId, sourceItemId],
  );
}

function buildReviewReport() {
  const rows = ALL_ARTICLES.map((article) => {
    const score = article.humanizer;
    return `| ${article.slug} | ${humanizerTotal(article)}/50 | ${score.directness} | ${score.rhythm} | ${score.trust} | ${score.authenticity} | ${score.concision} | ${article.humanizer.notes} |`;
  }).join("\n");

  const sourceRows = ALL_ARTICLES.map((article) => {
    const sourceLabels = article.sourceIds
      .map((id) => SOURCES.find((source) => source.id === id))
      .filter(Boolean)
      .map((source) => `[${source?.sourceName}: ${source?.title}](${source?.url})`)
      .join("；");
    return `| ${article.slug} | ${sourceLabels} |`;
  }).join("\n");

  return `# Read first A 档文章 humanizer-zh 审查

生成时间：${new Date().toISOString()}

## 评分

| slug | 总分 | 直接性 | 节奏 | 信任度 | 真实性 | 精炼度 | 备注 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${rows}

## Source pack

| slug | sources |
| --- | --- |
${sourceRows}
`;
}

async function main() {
  const failures = ALL_ARTICLES.flatMap((article) =>
    validateArticle(article).map((failure) => `${article.slug}: ${failure}`),
  );
  if (failures.length > 0) {
    throw new Error(`Article validation failed:\n${failures.join("\n")}`);
  }

  const missingSources = new Set<string>();
  for (const article of ALL_ARTICLES) {
    for (const sourceId of article.sourceIds) {
      if (!SOURCES.some((source) => source.id === sourceId)) {
        missingSources.add(`${article.slug}: ${sourceId}`);
      }
    }
  }
  if (missingSources.size > 0) {
    throw new Error(`Missing source definitions:\n${[...missingSources].join("\n")}`);
  }

  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");

  if (!WRITE) {
    console.log(`Validated ${ALL_ARTICLES.length} A-tier article(s).`);
    for (const article of ALL_ARTICLES) {
      console.log(`- ${article.slug}: ${article.body.length} chars, humanizer ${humanizerTotal(article)}/50`);
    }
    console.log("Dry run only. Re-run with --write to update the database and review report.");
    return;
  }

  for (const source of SOURCES) {
    await upsertSource(db, source);
  }

  for (const article of ALL_ARTICLES) {
    const entity = await findEntity(db, article.slug);
    if (!entity) throw new Error(`Missing pen entity: ${article.slug}`);

    const storyId = await upsertStory(db, entity.id, article);
    await execute(
      db,
      "UPDATE entities SET summary = ?, updated_at = datetime('now') WHERE id = ?",
      [article.summary, entity.id],
    );

    for (const sourceId of article.sourceIds) {
      const source = SOURCES.find((item) => item.id === sourceId);
      if (!source) throw new Error(`Missing source: ${sourceId}`);
      await linkSource(db, entity.id, storyId, source);
    }
    console.log(`Updated ${article.slug}: ${article.body.length} chars`);
  }

  mkdirSync(path.dirname(REVIEW_PATH), { recursive: true });
  writeFileSync(REVIEW_PATH, buildReviewReport());
  console.log(`Wrote ${REVIEW_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
